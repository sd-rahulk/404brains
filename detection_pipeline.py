import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from tensorflow.keras import layers, models
import joblib

def run_detection():
    # Load data
    df = pd.read_csv("synthetic_logs.csv", parse_dates=["timestamp"])
    df["date"] = df["timestamp"].dt.floor("D")
    df["hour"] = df["timestamp"].dt.hour

    # Aggregate features per user per day
    agg = df.groupby(["user", "date"]).agg(
        login_count=("event_type", lambda x: (x == "login").sum()),
        failed_login=("event_type", lambda x: (x == "login_fail").sum()),
        files_read=("event_type", lambda x: (x == "read").sum()),
        bytes_read=("bytes", "sum"),
        distinct_apps=("app", "nunique"),
        avg_login_hour=("hour", "mean")
    ).reset_index().fillna(0)

    # Derived features
    agg["fail_ratio"] = agg["failed_login"] / (agg["login_count"] + 1)
    agg["bytes_per_read"] = agg["bytes_read"] / (agg["files_read"] + 1)

    # User-level baselines
    user_means = agg.groupby("user").mean(numeric_only=True).add_suffix("_mean")
    agg = agg.merge(user_means, on="user", how="left")
    agg["bytes_read_z"] = (agg["bytes_read"] - agg["bytes_read_mean"]) / (agg["bytes_read_mean"] + 1)

    features = [
        "login_count", "failed_login", "files_read", "bytes_read",
        "distinct_apps", "avg_login_hour", "fail_ratio",
        "bytes_per_read", "bytes_read_z"
    ]

    X = agg[features].fillna(0)

    # Scale features
    scaler = StandardScaler().fit(X)
    Xs = scaler.transform(X)

    # Isolation Forest
    if_model = IsolationForest(n_estimators=200, contamination=0.05, random_state=0)
    if_model.fit(Xs)
    scores_if = -if_model.decision_function(Xs)
    agg["if_score"] = (scores_if - scores_if.min()) / (scores_if.max() - scores_if.min())

    # Autoencoder
    input_dim = Xs.shape[1]
    encoding_dim = max(2, input_dim // 2)
    inp = layers.Input(shape=(input_dim,))
    encoded = layers.Dense(encoding_dim, activation="relu")(inp)
    decoded = layers.Dense(input_dim, activation="linear")(encoded)
    autoenc = models.Model(inp, decoded)
    autoenc.compile(optimizer="adam", loss="mse")
    autoenc.fit(Xs, Xs, epochs=10, batch_size=16, verbose=0)
    recon = autoenc.predict(Xs, verbose=0)
    re_err = np.mean((Xs - recon) ** 2, axis=1)
    agg["ae_score"] = (re_err - re_err.min()) / (re_err.max() - re_err.min())

    # Simple rule-based checks
    agg["rule_outside_hours"] = (agg["avg_login_hour"] < 6) | (agg["avg_login_hour"] > 22)
    agg["rule_mass_download"] = agg["bytes_read"] > 1e9
    agg["rule_score"] = (
        agg["rule_outside_hours"].astype(int) +
        agg["rule_mass_download"].astype(int)
    ) / 2

    # Combined risk score
    agg["risk_score"] = (
        0.5 * agg["if_score"] +
        0.3 * agg["ae_score"] +
        0.2 * agg["rule_score"]
    )

    # Save results
    agg.to_csv("risk_scores.csv", index=False)
    agg.sort_values("risk_score", ascending=False).head(20).to_csv("top_alerts.csv", index=False)

    # Save models
    joblib.dump({"if_model": if_model, "scaler": scaler}, "iforest_model.pkl")
    autoenc.save("autoencoder_model.h5")

    print("Risk scores saved to risk_scores.csv")
    print("Top 5 anomalies:")
    print(agg.sort_values("risk_score", ascending=False).head(5))


if __name__ == "__main__":
    run_detection()
