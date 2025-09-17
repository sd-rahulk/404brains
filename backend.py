from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

def explain_row(row):
    reasons = []
    if row.get("bytes_read",0) > 1e9:
        reasons.append("Copying sensitive files (large download)")
    if row.get("failed_login",0) > 3:
        reasons.append("Multiple failed login attempts")
    if row.get("rule_outside_hours",False):
        reasons.append("Weekend or outside working hours login")
    if str(row.get("command","")).lower() in ["scp","powershell","curl","tar","7z"]:
        reasons.append("Suspicious command executed")
    if str(row.get("app","")).lower() in ["dropbox","usb_copy","7zip","winscp"]:
        reasons.append("Unusual application usage")
    if row.get("if_score",0) > 0.9:
        reasons.append("High anomaly score (Isolation Forest)")
    if row.get("ae_score",0) > 0.9:
        reasons.append("High anomaly score (Autoencoder)")
    return reasons or ["Statistical anomaly detected"]

@app.route("/alerts")
def get_alerts():
    # Prefer top_alerts.csv if available
    if os.path.exists("top_alerts.csv"):
        df = pd.read_csv("top_alerts.csv")
    elif os.path.exists("risk_scores.csv"):
        df = pd.read_csv("risk_scores.csv")
    else:
        return jsonify({"error":"Run detection_pipeline.py first!"})

    recs = df.to_dict(orient="records")
    for r in recs:
        r["explanation"] = explain_row(r)
    return jsonify(recs)

@app.route("/timeline/<user>")
def get_timeline(user):
    """Return raw logs for a specific user (for frontend timeline view)"""
    if not os.path.exists("synthetic_logs.csv"):
        return jsonify({"error":"No synthetic_logs.csv found!"})
    df = pd.read_csv("synthetic_logs.csv")
    user_logs = df[df["user"] == user].sort_values("timestamp")
    return jsonify(user_logs.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(port=5050, debug=True)
