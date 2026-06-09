"""
TheraQuest V2 - All-in-One: Start Backend + Run Test
"""
import os
import sys
import json
import time
import threading
import urllib.request

# Setup path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

import uvicorn

def run_server():
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, app_dir=project_root, log_level="warning")

def run_test():
    time.sleep(4)  # wait for server to start
    print("\n" + "="*55)
    print("  TheraQuest V2 — Amaterasu Pipeline Integration Test")
    print("="*55)
    
    payload = {
        "user_id": "demo-user",
        "message": "I feel very anxious and overwhelmed. I cannot focus and everything feels impossible."
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        "http://localhost:8000/api/interact",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            r = json.loads(resp.read())

            print("\n[AGENT 1 — Therapist]")
            print(r["therapist_reply"])

            q = r["quest"]
            print("\n[AGENT 2 — Quest Generator]")
            print("Quest Title :", q["quest_title"])
            print("Quest Lore  :", q["quest_lore"])
            print("Total XP    :", q["total_xp"])
            for i, step in enumerate(q["steps"], 1):
                print(f"  Step {i}: {step['description']} (+{step['xp_reward']} XP)")

            m = r["vector_metrics"]
            print("\n[AGENT 3 — Supervisor Validated Metrics]")
            print("Anxiety Score   :", m["anxiety"])
            print("Engagement Score:", m["engagement"])

            print("\n" + "="*55)
            print("  ALL 3 AGENTS WORKING — PIPELINE COMPLETE!")
            print("="*55)
    except Exception as e:
        print("\nPIPELINE ERROR:", e)
    finally:
        # Shutdown server after test
        os._exit(0)

if __name__ == "__main__":
    t = threading.Thread(target=run_test, daemon=True)
    t.start()
    run_server()
