from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np

# --------------------------
# Load model, scaler, encoder
# --------------------------
model = joblib.load('isolation_forest_model.pkl')
scaler = joblib.load('scaler.pkl')
le = joblib.load('label_encoder.pkl')

features_list = [
    "login_count", "failed_login", "files_read", "bytes_read",
    "if_score", "ae_score", "rule_outside_hours", "rule_mass_download", "rule_score"
]

app = Flask(__name__)

# --------------------------
# Serve HTML page
# --------------------------
@app.route('/')
def home():
    return render_template('index.html')

# --------------------------
# API for prediction
# --------------------------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Encode user safely
        user_input = data.get("user")
        if user_input in le.classes_:
            user_encoded = le.transform([user_input])[0]
        else:
            user_encoded = -1  # unseen user

        # Prepare features
        features_input = [data[feat] for feat in features_list]

        # Optional: prepend user_encoded if your model used it
        # features_input.insert(0, user_encoded)

        # Scale
        features_scaled = scaler.transform([features_input])

        # Predict
        prediction = model.predict(features_scaled)[0]
        anomaly = True if prediction == -1 else False

        return jsonify({"anomaly": anomaly})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --------------------------
if __name__ == '__main__':
    app.run(debug=True)
