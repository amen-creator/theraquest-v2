import os
import httpx
import logging
import json
import asyncio
from bs4 import BeautifulSoup
import urllib.parse
from groq import AsyncGroq
from schemas import NimbleSource

logger = logging.getLogger("amaterasu.nimble")

def get_llm_client():
    api_key = os.environ.get("GROQ_API_KEY")
    return AsyncGroq(api_key=api_key)

async def check_if_needs_search(message: str) -> str:
    """
    Uses LLM to dynamically determine if a user query requires real-world data
    and generates an optimized search query.
    Returns the search query, or None if no search is needed.
    """
    prompt = f"""You are the Search Router for a CBT therapy app.
Evaluate the following user message: "{message}"

If the user is asking for:
- Local clinics or therapists (e.g. "near me")
- Latest news, studies, or research on mental health
- Real-world support groups or external resources

Return a JSON object: {{"needs_search": true, "optimized_query": "specific search terms"}}
If it's just a general emotional statement (e.g., "I feel sad", "I'm stressed"), return: {{"needs_search": false, "optimized_query": null}}

RETURN ONLY VALID JSON."""
    try:
        client = get_llm_client()
        res = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        data = json.loads(res.choices[0].message.content)
        if data.get("needs_search"):
            return data.get("optimized_query")
    except Exception as e:
        logger.error(f"Routing LLM error: {e}")
    return None

async def fallback_scrape(query: str):
    """
    Simulates Nimble's Extract feature by doing a duckduckgo search 
    and returning simulated structured results.
    """
    try:
        encoded = urllib.parse.quote(query)
        url = f"https://html.duckduckgo.com/html/?q={encoded}"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            sources = []
            for item in soup.find_all('div', class_='result', limit=3):
                title_tag = item.find('a', class_='result__url')
                snippet_tag = item.find('a', class_='result__snippet')
                
                if title_tag and snippet_tag:
                    sources.append(NimbleSource(
                        title=title_tag.text.strip(),
                        url=title_tag.get('href', '#'),
                        snippet=snippet_tag.text.strip()
                    ))
            
            if sources:
                context = "Live Web Context Extracted:\n" + "\n".join(f"- {s.title}: {s.snippet}" for s in sources)
                return context, sources
    except Exception as e:
        logger.error(f"Fallback scrape failed: {e}")
    
    return None, []

async def nimble_search_and_extract(query: str):
    """
    Executes a Live Web Search using Nimbleway API and Extracts content.
    Returns (context_string, list[NimbleSource])
    """
    nimble_key = os.environ.get("NIMBLE_API_KEY")
    
    if not nimble_key:
        logger.info("NIMBLE_API_KEY not found. Simulating Nimble extraction loop via fallback.")
        return await fallback_scrape(query)

    try:
        logger.info(f"Nimble Web API starting for query: {query}")
        url = "https://api.webit.live/api/v1/realtime/search"
        headers = {
            "Authorization": f"Basic {nimble_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "parse": True,
            "search_engine": "google_search",
            "query": query,
            "country": "US"
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            organic_results = data.get("parsing", {}).get("entities", {}).get("OrganicResult", [])
            sources = []
            
            for res in organic_results[:3]:
                sources.append(NimbleSource(
                    title=res.get("title", "No Title"),
                    url=res.get("url", "#"),
                    snippet=res.get("snippet", "No description available.")
                ))
                
            if sources:
                context = "🌐 **Live Web Context (via Nimble):**\n"
                for idx, s in enumerate(sources):
                    context += f"{idx+1}. **{s.title}**: {s.snippet}\n"
                return context, sources
            
    except Exception as e:
        logger.error(f"Nimble API Error: {e}")
        return await fallback_scrape(query)
        
    return None, []

async def run_nimble_agent(message: str):
    """
    Main entry point for Nimble Live Web Agent.
    Returns (context_string, list_of_sources)
    """
    search_query = await check_if_needs_search(message)
    
    if search_query:
        logger.info(f"Agent 4 (Nimble) executing search for: {search_query}")
        context, sources = await nimble_search_and_extract(search_query)
        return context, [s.model_dump() for s in sources]
    
    return None, []
