from fastapi import FastAPI, Request
from pydantic import BaseModel
import xgboost as xgb
import pandas as pd
from URLFeatureExtraction import featureExtraction # Assuming URLFeatureExtraction.py is in the same directory
import numpy as np

app = FastAPI()

# Load the XGBoost model
model = xgb.Booster()
model.load_model("xgboost_model.json")

class InputData(BaseModel):
    url: str

@app.get("/")
def read_root():
    return {"message": "Phishing Detection API is working!"}

@app.post("/predict")
def predict(data: InputData):
    # Extract features from the URL
    # featureExtraction should return a list of 16 features
    extracted_features = featureExtraction(data.url)

    feature_names = [
        'Have_IP', 'Have_At', 'URL_Length', 'URL_Depth', 'Redirection',
        'https_Domain', 'TinyURL', 'Prefix/Suffix', 'DNS_Record', 'Web_Traffic',
        'Domain_Age', 'Domain_End', 'iFrame', 'Mouse_Over', 'Right_Click', 'Web_Forwards'
    ]

    # Convert to DataFrame with correct column names, then DMatrix
    df = pd.DataFrame([extracted_features], columns=feature_names)
    dmatrix = xgb.DMatrix(df)

    # Get the raw prediction (probability)
    prediction_proba = model.predict(dmatrix)

    # prediction_proba is likely a numpy array like array([0.823], dtype=float32)
    # Extract the float value
    score = float(prediction_proba[0])

    # Determine if it's phishing based on a threshold
    is_phishing = score > 0.5 # Example threshold, can be tuned

    # The frontend expects 'is_phishing' and 'score'.
    # It also uses 'features' in popup.js, but the backend is not providing them directly anymore.
    # This might require an adjustment in popup.js later if those specific features are still needed for display.
    # For now, fulfilling the primary requirement of is_phishing and score.
    return {"is_phishing": is_phishing, "score": score, "prediction_label": "phishing" if is_phishing else "legitimate"}
