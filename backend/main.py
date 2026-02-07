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
    risk_score: int
    attack_vectors: list[str]
    messages: list[str]

def is_similar_to_brand(brand: str, domain: str) -> bool:
    """Check if domain uses character substitution to mimic a brand"""
    domain_lower = domain.lower()
    
    # Direct substring match
    if brand in domain_lower:
        return True
    
    # Common character substitutions used in typosquatting
    substitutions = {
        '0': 'o', '1': 'i', '1': 'l', '3': 'e', '5': 's', 
        '$': 's', '@': 'a', '!': 'i'
    }
    
    # Try replacing characters in brand and check if it appears in domain
    for char, replacement in substitutions.items():
        modified_brand = brand.replace(replacement, char)
        if modified_brand in domain_lower:
            return True
        
        # Also check reverse (e.g., domain has "g00gle")
        modified_domain = domain_lower.replace(char, replacement)
        if brand in modified_domain:
            return True
    
    return False

def analyze_security(url: str) -> dict:
    risk_score = 0
    messages = []
    attack_vectors = []
    
    # 1. Expand Shortened URLs (Follow Redirects)
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        final_url = response.url
        if final_url != url:
            messages.append(f"🔄 Redirect detected: {url} → {final_url}")
    except Exception as e:
        return {
            "risk": "HIGH_RISK", 
            "final": url, 
            "msgs": ["❌ Could not resolve URL. It might be dead, blocked, or malicious."],
            "attack_vectors": ["UNRESOLVABLE_URL"],
            "score": 10
        }
    
    parsed = urlparse(final_url)
    domain = parsed.netloc
    
    # ATTACK VECTOR 1: Unencrypted Connection
    if parsed.scheme != "https":
        risk_score += 2
        attack_vectors.append("UNENCRYPTED_CONNECTION")
        messages.append("⚠️ Connection is not secure (HTTP). Attackers can intercept your data.")
    
    # ATTACK VECTOR 2: IP Address Hosting
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
        risk_score += 3
        attack_vectors.append("IP_ADDRESS_HOSTING")
        messages.append("🚨 Uses raw IP address instead of domain. Common for temporary phishing sites.")
    
    # ATTACK VECTOR 3: Suspicious TLDs
    high_risk_tlds = ['.xyz', '.top', '.club', '.zip', '.review', '.work', '.click', '.link']
    matched_tld = next((tld for tld in high_risk_tlds if domain.endswith(tld)), None)
    if matched_tld:
        risk_score += 2
        attack_vectors.append("SUSPICIOUS_TLD")
        messages.append(f"⚠️ Domain uses '{matched_tld}' extension, frequently used for scams.")
    
    # ATTACK VECTOR 4: Typosquatting Detection
    popular_brands = [
        'google', 'microsoft', 'paypal', 'amazon', 'apple', 
        'facebook', 'instagram', 'netflix', 'yahoo', 'twitter',
        'linkedin', 'dropbox', 'adobe', 'spotify'
    ]
    
    for brand in popular_brands:
        if is_similar_to_brand(brand, domain):
            risk_score += 3
            attack_vectors.append("TYPOSQUATTING")
            messages.append(f"🚨 Domain mimics '{brand.title()}' - likely a phishing attempt!")
            break  # Only report once
    
    # ATTACK VECTOR 5: Suspicious Keywords
    suspicious_keywords = [
        'login', 'verify', 'account', 'secure', 'update', 'confirm',
        'suspended', 'locked', 'urgent', 'password', 'banking', 'wallet'
    ]
    url_lower = final_url.lower()
    found_keywords = [kw for kw in suspicious_keywords if kw in url_lower]
    
    if found_keywords:
        risk_score += 1
        attack_vectors.append("SUSPICIOUS_KEYWORDS")
        messages.append(f"⚠️ Contains suspicious words: {', '.join(found_keywords[:3])}")
    
    # ATTACK VECTOR 6: URL Obfuscation (Long URLs)
    if len(final_url) > 75:
        risk_score += 1
        attack_vectors.append("URL_OBFUSCATION")
        messages.append("⚠️ Unusually long URL may hide malicious content.")
    
    # Determine Risk Level
    if risk_score == 0:
        level = "SAFE"
        messages.append("✅ No obvious threats detected. URL appears safe.")
    elif risk_score < 4:
        level = "CAUTION"
    else:
        level = "HIGH_RISK"
    
    return {
        "risk": level,
        "final": final_url,
        "msgs": messages,
        "attack_vectors": attack_vectors,
        "score": risk_score
    }

@app.post("/scan", response_model=ScanResponse)
async def scan_url(request: ScanRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="No URL provided")
    
    result = analyze_security(request.url)
    
    return {
        "original_url": request.url,
        "final_url": result["final"],
        "risk_level": result["risk"],
        "risk_score": result["score"],
        "attack_vectors": result["attack_vectors"],
        "messages": result["msgs"]
    }

# Run with: uvicorn main:app --reload