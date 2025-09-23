import joblib
import pandas as pd

# Load the trained model
model = joblib.load("kepler_model.pkl")

def predict_exoplanet(features_dict):
    df = pd.DataFrame([features_dict])
    return model.predict(df)[0]

# Optional: CSV upload function
def predict_csv(file):
    df = pd.read_csv(file)
    df["prediction"] = model.predict(df)
    return df.to_dict(orient="records")
