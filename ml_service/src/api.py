from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import pandas as pd
from typing import List, Optional

app = FastAPI(title="SPIS ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ExpiryRiskInput(BaseModel):
    medicine_id: int
    days_until_expiry: int
    current_stock: int
    avg_daily_sales: float
    category: str
    unit_price: float

class DemandForecastInput(BaseModel):
    medicine_id: int
    days_ahead: int = 30

# Health check
@app.get("/")
def read_root():
    return {"status": "OK", "message": "SPIS ML Service is running"}

# Demand forecasting endpoint
@app.post("/api/ml/forecast/{medicine_id}")
async def get_demand_forecast(medicine_id: int, days: int = 30):
    """
    Predict future demand for a medicine
    """
    try:
        # Load model (placeholder - actual model would be loaded from file)
        # with open(f'models/demand_{medicine_id}.pkl', 'rb') as f:
        #     model = pickle.load(f)
        
        # For demo: return mock predictions
        predictions = [
            {
                "date": f"2026-02-{10+i}",
                "predicted_quantity": 15 + (i % 5),
                "confidence_lower": 10 + (i % 5),
                "confidence_upper": 20 + (i % 5)
            }
            for i in range(min(days, 30))
        ]
        
        return {
            "success": True,
            "medicine_id": medicine_id,
            "predictions": predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Expiry risk prediction endpoint
@app.post("/api/ml/expiry-risk")
async def predict_expiry_risk(data: ExpiryRiskInput):
    """
    Predict expiry risk for a medicine
    """
    try:
        # Simple rule-based logic (placeholder for actual ML model)
        days_to_sell = data.current_stock / max(data.avg_daily_sales, 0.1)
        
        if days_to_sell > data.days_until_expiry:
            risk_score = min(100, (days_to_sell / data.days_until_expiry) * 100)
            risk_level = "high" if risk_score > 70 else "medium" if risk_score > 40 else "low"
        else:
            risk_score = 10
            risk_level = "low"
        
        recommended_action = ""
        if risk_level == "high":
            recommended_action = "Offer discount or return to supplier"
        elif risk_level == "medium":
            recommended_action = "Monitor closely and promote"
        else:
            recommended_action = "No action needed"
        
        return {
            "success": True,
            "medicine_id": data.medicine_id,
            "risk_score": round(risk_score, 2),
            "risk_level": risk_level,
            "days_until_expiry": data.days_until_expiry,
            "estimated_days_to_sell": round(days_to_sell, 1),
            "recommended_action": recommended_action
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Auto-reorder recommendation endpoint
@app.post("/api/ml/reorder/{medicine_id}")
async def get_reorder_recommendation(medicine_id: int):
    """
    Calculate optimal reorder quantity and timing
    """
    try:
        # Placeholder calculations
        return {
            "success": True,
            "medicine_id": medicine_id,
            "current_stock": 50,
            "reorder_point": 30,
            "optimal_order_quantity": 100,
            "safety_stock": 20,
            "should_reorder": True,
            "urgency": "NORMAL"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
