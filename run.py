"""
TheraQuest V2 - Backend Launch Script
Run from: C:\\Users\\amend\\Documents\\AI AGENT\\WORKSPACE\\EARNING
Command:  .\\venv\\Scripts\\python.exe projects\\theraquest_v2\\run.py
"""
import os
import sys

# Add theraquest_v2 to PYTHONPATH so 'backend.*' imports work
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# Load .env from theraquest_v2 folder
from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

import uvicorn

if __name__ == "__main__":
    print("🚀 Starting TheraQuest V2 Amaterasu Pipeline on http://localhost:8000")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True, app_dir=project_root)
