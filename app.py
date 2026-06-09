# app.py
from fastapi import FastAPI, Request
from pydantic import BaseModel
import xgboost as xgb
import pandas as pd

app = FastAPI()
model = xgb.Booster()
model.load_model("xgboost_model.json")

class InputData(BaseModel):
    features: list  # or Dict if named

@app.post("/predict")
def predict(data: InputData):
    dmatrix = xgb.DMatrix(pd.DataFrame([data.features]))
    prediction = model.predict(dmatrix)
    return {"prediction": prediction.tolist()}

# app.py

from fastapi import FastAPI

app = FastAPI()  # ✅ This must exist

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI is working!"}

