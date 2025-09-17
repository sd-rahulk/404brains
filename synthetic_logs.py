import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_logs(n_users=20, days=14, anomalies=True, seed=42):
    np.random.seed(seed)
    users = [f"user{i}" for i in range(1, n_users+1)]
    start_date = datetime.now() - timedelta(days=days)
    logs = []

    suspicious_cmds = ["scp","powershell","curl","net user","tar","7z"]
    risky_apps = ["dropbox","usb_copy","7zip","winscp"]

    for user in users:
        for d in range(days):
            date = start_date + timedelta(days=d)

            # Normal login
            logs.append({
                "timestamp": (date + timedelta(hours=np.random.randint(8, 18))).isoformat(),
                "user": user,
                "event_type": "login",
                "bytes": 0,
                "app": "auth_service",
                "command": "",
                "host": f"host{np.random.randint(1,6)}",
                "session_id": f"{user}_{d}_{np.random.randint(1000)}"
            })

            # File read
            bytes_downloaded = max(0, int(np.random.normal(50_000_000, 20_000_000)))
            logs.append({
                "timestamp": (date + timedelta(hours=np.random.randint(9, 18))).isoformat(),
                "user": user,
                "event_type": "read",
                "bytes": bytes_downloaded,
                "app": "fileshare",
                "command": "",
                "host": f"host{np.random.randint(1,6)}",
                "session_id": f"{user}_{d}_{np.random.randint(1000)}"
            })

            # Failed login
            if np.random.rand() < 0.1:
                logs.append({
                    "timestamp": (date + timedelta(hours=np.random.randint(0, 23))).isoformat(),
                    "user": user,
                    "event_type": "login_fail",
                    "bytes": 0,
                    "app": "auth_service",
                    "command": "",
                    "host": f"host{np.random.randint(1,6)}",
                    "session_id": f"{user}_{d}_{np.random.randint(1000)}"
                })

            # Inject anomalies
            if anomalies and np.random.rand() < 0.05:
                logs.append({
                    "timestamp": (date + timedelta(hours=np.random.randint(0, 23))).isoformat(),
                    "user": user,
                    "event_type": "read",
                    "bytes": np.random.randint(1_000_000_000, 5_000_000_000, dtype=np.int64),  # FIXED
                    "app": "fileshare",
                    "command": random.choice(suspicious_cmds).lower(),
                    "host": f"host{np.random.randint(1,6)}",
                    "session_id": f"{user}_{d}_{np.random.randint(1000)}"
                 })

            

            # Inject app misuse
            if anomalies and np.random.rand() < 0.05:
                logs.append({
                    "timestamp": (date + timedelta(hours=np.random.randint(0, 23))).isoformat(),
                    "user": user,
                    "event_type": "app_use",
                    "bytes": 0,
                    "app": random.choice(risky_apps).lower(),
                    "command": "",
                    "host": f"host{np.random.randint(1,6)}",
                    "session_id": f"{user}_{d}_{np.random.randint(1000)}"
                })

    return pd.DataFrame(logs)

if __name__ == "__main__":
    df = generate_logs()
    df.to_csv("synthetic_logs.csv", index=False)
    print(f" Synthetic logs saved to synthetic_logs.csv (rows={len(df)})")
