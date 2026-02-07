from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import re
from urllib.parse import urlparse

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    url: str

class ScanResponse(BaseModel):
    original_url: str
    final_url: str
    risk_level: str  # "SAFE", "CAUTION", "HIGH_RISK"
    messages: list[str]

def analyze_security(url: str) -> dict:
    risk_score = 0
    messages = []
    
    # 1. Expand Shortened URLs (The "Unmasking" Phase)
    try:
        # We use a HEAD request to follow redirects without downloading body content
        response = requests.head(url, allow_redirects=True, timeout=5)
        final_url = response.url
        if final_url != url:
            messages.append(f"Redirect detected: Originally {url}, lands on {final_url}")
    except Exception as e:
        return {"risk": "HIGH_RISK", "final": url, "msgs": ["Could not resolve URL. It might be dead or blocked."]}

    parsed = urlparse(final_url)
    domain = parsed.netloc

    # 2. Static Analysis Rules (The "Lite" Logic)
    
    # Check for HTTP (Unencrypted)
    if parsed.scheme != "https":
        risk_score += 2
        messages.append("Connection is not secure (HTTP only). Passwords/data can be intercepted.")

    # Check for IP Address Usage (Common in malware hosting)
    # Regex for standard IPv4
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
        risk_score += 3
        messages.append("Host is a raw IP address, not a verified domain name.")

    # Check for Suspicious TLDs (Top Level Domains)
    suspicious_tlds = ['.xyz', '.top', '.club', '.zip', '.review']
    if any(domain.endswith(tld) for tld in suspicious_tlds):
        risk_score += 1
        messages.append(f"Uses a domain extension ({domain.split('.')[-1]}) often associated with spam.")

    # Check for Long/Obfuscated URLs
    if len(final_url) > 75:
        risk_score += 1
        messages.append("URL is unusually long, which can hide malicious parameters.")

    # 3. Determine Risk Level
    if risk_score == 0:
        level = "SAFE"
        messages.append("No obvious threats detected.")
    elif risk_score < 3:
        level = "CAUTION"
    else:
        level = "HIGH_RISK"

    return {"risk": level, "final": final_url, "msgs": messages}

@app.post("/scan", response_model=ScanResponse)
async def scan_url(request: ScanRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="No URL provided")
    
    result = analyze_security(request.url)
    
    return {
        "original_url": request.url,
        "final_url": result["final"],
        "risk_level": result["risk"],
        "messages": result["msgs"]
    }

# Run with: uvicorn main:app --reload