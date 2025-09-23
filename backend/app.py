# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)  # allow all origins (fine for local dev)

# Load the model from the same folder as this file
MODEL_PATH = os.path.join(os.path.dirname(
    __file__), "kepler_model_all_data.pkl")
model = joblib.load(MODEL_PATH)

# IMPORTANT: set the exact feature columns your model expects, in the same order you trained with.
# Replace this list with the features you used when training.
FEATURE_COLUMNS = [
    'koi_period', 'koi_period_err1', 'koi_period_err2',
    'koi_duration', 'koi_duration_err1', 'koi_duration_err2',
    'koi_depth', 'koi_depth_err1', 'koi_depth_err2',
    'koi_prad', 'koi_prad_err1', 'koi_prad_err2',
    'koi_teq', 'koi_teq_err1', 'koi_teq_err2',
    'koi_insol', 'koi_insol_err1', 'koi_insol_err2',
    'koi_model_snr', 'koi_steff', 'koi_steff_err1', 'koi_steff_err2',
    'koi_slogg', 'koi_slogg_err1', 'koi_slogg_err2',
    'koi_srad', 'koi_srad_err1', 'koi_srad_err2',
    'koi_kepmag'
]

# If you encoded labels during training, set the mapping here.
# From your earlier reports the order was: CANDIDATE, CONFIRMED, FALSE POSITIVE
LABEL_MAP = {0: "CANDIDATE", 1: "CONFIRMED", 2: "FALSE POSITIVE"}


def prepare_df(raw_rows):
    """
    raw_rows: list of dicts (each dict: column_name -> value) or a single dict
    returns DataFrame aligned to FEATURE_COLUMNS (fills missing with NaN -> mean later)
    """
    if isinstance(raw_rows, dict):
        df = pd.DataFrame([raw_rows])
    else:
        df = pd.DataFrame(raw_rows)

    # Keep only feature columns in the right order. If missing columns, they become NaN.
    df = df.reindex(columns=FEATURE_COLUMNS)
    # Fill NaNs with column means to avoid errors (you can change strategy)
    df = df.fillna(df.mean())
    return df


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accepts JSON:
    - Single input: {"features": {col1: val1, col2: val2, ...}}
    - Batch input: {"rows": [{...}, {...}, ...]}
    Returns:
    {"predictions": ["CANDIDATE","CONFIRMED",...], "probabilities": [[p0,p1,p2], ...]}
    """
    payload = request.get_json(force=True)
    # support both keys
    if "features" in payload:
        df = prepare_df(payload["features"])
    elif "rows" in payload:
        df = prepare_df(payload["rows"])
    else:
        return jsonify({"error": "Expected JSON with 'features' or 'rows' key"}), 400

    # Predict
    preds = model.predict(df)
    # If your model returns encoded ints, map them; if returns strings, leave as-is
    try:
        # If numeric, map with LABEL_MAP
        if pd.api.types.is_integer_dtype(pd.Series(preds)):
            readable = [LABEL_MAP.get(int(p), str(p)) for p in preds]
        else:
            readable = [str(p) for p in preds]
    except Exception:
        readable = [str(p) for p in preds]

    # Probabilities if available
    prob_list = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(df)  # shape (n_samples, n_classes)
        # convert to regular Python floats for JSON
        prob_list = probs.tolist()

    return jsonify({"predictions": readable, "probabilities": prob_list})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
