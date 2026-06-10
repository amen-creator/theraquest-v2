import urllib.request
import json
import time

time.sleep(2)

payload = {"user_id": "test-user", "message": "I feel very anxious and overwhelmed today, I cannot focus on anything"}
data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    "http://localhost:8000/api/interact",
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req, timeout=40) as resp:
        result = json.loads(resp.read())

        print("=== THERAPIST AGENT REPLY ===")
        print(result["therapist_reply"])
        print()

        q = result["quest"]
        print("=== QUEST GENERATOR AGENT ===")
        print("Title:", q["quest_title"])
        print("Lore:", q["quest_lore"])
        print("Total XP:", q["total_xp"])
        for i, step in enumerate(q["steps"], 1):
            desc = step["description"]
            xp   = step["xp_reward"]
            print("  Step", i, ":", desc, "(+" + str(xp) + " XP)")
        print()

        m = result["vector_metrics"]
        print("=== SUPERVISOR VALIDATED METRICS ===")
        print("Anxiety:    ", m["anxiety"])
        print("Engagement: ", m["engagement"])
        print()
        print("SUCCESS - All 3 Agents Operational. Amaterasu Pipeline Complete!")

except Exception as e:
    print("ERROR:", e)
