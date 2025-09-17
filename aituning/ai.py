# (1) preprocess -> features -> scale -> train IsolationForest -> score -> evaluate
import numpy as np, pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import precision_score, recall_score, f1_score
import joblib

# load features (rows = sessions)
df = pd.read_parquet("features.parquet")  # must include numeric cols + optional 'label'
feature_cols = ['files_last_hour_log','bytes_out_log','unique_domains','off_hours','sensitive_files_24h']
X = df[feature_cols].fillna(0)

# transform
X['files_last_hour_log'] = np.log1p(X['files_last_hour_log'])
X['bytes_out_log'] = np.log1p(X['bytes_out_log'])
scaler = StandardScaler().fit(X)
X_s = scaler.transform(X)

# train (train on baseline / non-attack period)
train_idx = df['day'] <= 21
clf = IsolationForest(n_estimators=200, contamination=0.01, random_state=42)
clf.fit(X_s[train_idx])

# score
raw = -clf.decision_function(X_s)            # higher -> more anomalous
risk = (raw - raw.min()) / (raw.max() - raw.min())

# if you have labels (1=anomaly,0=normal) tune threshold
if 'label' in df.columns:
    y = df['label'].values
    best_f1, best_t = 0, 0
    for t in np.linspace(0, 1, 200):
        preds = (risk >= t).astype(int)
        f1 = f1_score(y, preds)
        if f1 > best_f1:
            best_f1, best_t = f1, t
    print("best_t, best_f1", best_t, best_f1)

# save model+scaler
joblib.dump(scaler, "scaler.joblib")
joblib.dump(clf, "isoforest.joblib")
