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
    # featureExtraction should return a list of 17 features
    extracted_features = featureExtraction(data.url)

    # Convert to DataFrame, then DMatrix
    # Ensure the DataFrame has the correct structure/column names if the model expects them
    # For now, assuming the model was trained on features without explicit names, just an ordered list
    df = pd.DataFrame([extracted_features])
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
