
import os
import sys

# Monkeypatch for Python < 3.10
if sys.version_info < (3, 10):
    try:
        import importlib_metadata
        import importlib.metadata
        importlib.metadata.packages_distributions = importlib_metadata.packages_distributions
    except ImportError:
        pass

import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil
from dotenv import load_dotenv

# Load environment variables FIRST
# Load environment variables FIRST
dotenv_path = os.path.join("crispitionss_lab", ".env")
load_dotenv(dotenv_path)

# Map GEMINI_API_KEY (from user .env) to GOOGLE_API_KEY (expected by LangChain)
if os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

api_key = os.getenv("GOOGLE_API_KEY")
print(f"Loading .env from: {os.path.abspath(dotenv_path)}")
if not api_key:
    # Fallback: Try reading strictly from the file in case load_dotenv failed silently?
    # But usually it works.
    print("❌ ERROR: GOOGLE_API_KEY not found in environment!")
    print("Please ensure crispitionss_lab/.env has GEMINI_API_KEY or GOOGLE_API_KEY.")
else:
    print(f"✅ GOOGLE_API_KEY found: {api_key[:5]}...{api_key[-5:]}")

# Import application logic
from crispitionss_lab.data_utils import read_dataset, summarize_df
from crispitionss_lab.graph import lab_graph

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_data(
    file: UploadFile = File(...),
    request: str = Form(...)
):
    try:
        # Read file content
        content = await file.read()
        
        # Parse DataFrame
        df = read_dataset(content, file.filename)
        
        # Summarize for LLM
        schema_summary = summarize_df(df)
        
        # Prepare state for LangGraph
        initial_state = {
            "schema": schema_summary,
            "user_request": request
        }
        
        # Run graph
        result = lab_graph.invoke(initial_state)
        
        # Prepare Data Preview (Head)
        # Handle nan/inf for JSON serialization
        preview_data = df.head(5).fillna("").to_dict(orient="records")

        return {
            "analysis": result.get("analysis_text", "No analysis generated."),
            "charts": result.get("charts_spec", []),
            "preview": preview_data
        }
        
    except Exception as e:
        return {"error": str(e)}

# Serve static files (After API routes to avoid conflicts)
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
