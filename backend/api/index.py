from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AI Analytics API")

# Add CORS middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Netlify URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Analytics API"}

class DataPayload(BaseModel):
    data: list

@app.post("/api/clean")
def clean_data(payload: DataPayload):
    # Dummy cleaning logic for now
    return {"status": "success", "message": "Data cleaned"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
