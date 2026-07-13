import pandas as pd
import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/api/clean")
async def clean_data(file: UploadFile = File(...)):
    try:
        # 1. Data Ingestion
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith('.xlsx') or file.filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV or Excel file.")

        initial_rows, initial_cols = df.shape

        # 2. Data Cleaning
        # Remove duplicates
        df = df.drop_duplicates()
        
        # Handle missing values
        # For numeric columns, fill with median. For categorical, fill with mode.
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")
        
        cleaned_rows, cleaned_cols = df.shape
        duplicates_removed = initial_rows - cleaned_rows

        # 3. Exploratory Data Analysis (EDA) - Summary Statistics
        # We convert to string format to handle NaNs and infinities cleanly in JSON
        summary_stats = df.describe().to_dict()

        # Convert a sample of the cleaned data back to dictionary for the frontend preview
        cleaned_sample = df.head(5).to_dict(orient='records')

        return {
            "status": "Success",
            "message": "Data cleaned successfully!",
            "metrics": {
                "initial_rows": initial_rows,
                "cleaned_rows": cleaned_rows,
                "duplicates_removed": duplicates_removed,
                "columns": cleaned_cols
            },
            "summary_statistics": summary_stats,
            "sample_data": cleaned_sample
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
