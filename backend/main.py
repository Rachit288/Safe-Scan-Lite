from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import re
from urllib.parse import urlparse
from typing import Optional
import base64
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Safe-Scan Lite API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "https://safe-scan-lite-cqnf.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Request/Response Models
# ============================================

class ScanRequest(BaseModel):
    qr_content: str

class DecodeRequest(BaseModel):
    image_base64: str

class Risk(BaseModel):
    level: str  # "safe", "caution", "danger"
    score: int  # 0-100

class Intent(BaseModel):
    code: str
    label: str

class Signals(BaseModel):
    short_url: bool
    brand_impersonation: bool
    payment_request: bool
    apk_download: bool
    http_only: bool
    domain_age_days: Optional[int]
    redirect_count: int

class SafePreview(BaseModel):
    final_domain: str
    https: bool
    content_type: str
    country: str
    file_download: bool

class Reputation(BaseModel):
    virustotal_detected: bool
    virustotal_score: int
    safe_browsing_threat: bool
    threat_types: list[str]
    checked_by: list[str]

class ScanResponse(BaseModel):
    status: str
    risk: Risk
    intent: Intent
    signals: Signals
    reputation: Reputation
    safe_preview: SafePreview
    checked_items: list[str]

class DecodeResponse(BaseModel):
    qr_content: str

class HealthResponse(BaseModel):
    status: str
    service: str

# ============================================
# URL Shortener Detection
# ============================================

SHORT_URL_DOMAINS = [
    'bit.ly', 'bitly.com', 't.co', 'goo.gl', 'tinyurl.com', 'ow.ly',
    'is.gd', 'buff.ly', 'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr',
    'twit.ac', 'tiny.cc', 'short.to', 'soo.gd', 'clicky.me', 
    's2r.co', 'cutt.ly', 'rb.gy', 't.ly', 'v.gd', 'dub.sh',
    'rebrand.ly', 'shorturl.at', 'bl.ink'
]

# ============================================
# Brand Impersonation Detection
# ============================================

KNOWN_BRANDS = [
    'paypal', 'paytm', 'amazon', 'google', 'microsoft', 'apple',
    'facebook', 'instagram', 'netflix', 'walmart', 'bank', 'chase',
    'wellsfargo', 'citibank', 'hdfc', 'icici', 'sbi', 'axis',
    'login', 'secure', 'verify', 'account', 'update', 'confirm'
]

LEGITIMATE_DOMAINS = [
    'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'paypal.com',
    'facebook.com', 'instagram.com', 'netflix.com', 'walmart.com',
    'chase.com', 'wellsfargo.com', 'citibank.com', 'github.com',
    'youtube.com', 'twitter.com', 'linkedin.com', 'wikipedia.org'
]

# ============================================
# Suspicious TLDs
# ============================================

SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.zip', '.review', '.click', 
                   '.work', '.date', '.loan', '.racing', '.win', '.stream']

# ============================================
# API Keys Configuration
# ============================================

VIRUSTOTAL_API_KEY = os.getenv('VIRUSTOTAL_API_KEY', '')
GOOGLE_SAFE_BROWSING_API_KEY = os.getenv('GOOGLE_SAFE_BROWSING_API_KEY', '')

# ============================================
# Analysis Functions
# ============================================

def is_short_url(domain: str) -> bool:
    """Check if domain is a known URL shortener"""
    return any(domain.endswith(short) or domain == short for short in SHORT_URL_DOMAINS)

def detect_brand_impersonation(domain: str, url: str) -> bool:
    """Check if URL is impersonating a known brand"""
    domain_lower = domain.lower()
    url_lower = url.lower()
    
    # If it's a legitimate domain, not impersonation
    for legit in LEGITIMATE_DOMAINS:
        if domain_lower.endswith(legit):
            return False
    
    # Check if domain contains brand names suspiciously
    for brand in KNOWN_BRANDS:
        if brand in domain_lower:
            # It contains a brand but isn't the real domain
            return True
        # Check for typosquatting patterns like go0gle, g00gle, etc.
        if brand in url_lower.replace('0', 'o').replace('1', 'l').replace('1', 'i'):
            return True
    
    return False

def detect_payment_request(url: str) -> bool:
    """Check if URL might be requesting payment"""
    payment_keywords = ['pay', 'payment', 'invoice', 'billing', 'btc', 
                        'bitcoin', 'crypto', 'wallet', 'transfer', 'upi']
    url_lower = url.lower()
    return any(keyword in url_lower for keyword in payment_keywords)

def detect_apk_download(url: str) -> bool:
    """Check if URL is an APK download"""
    return url.lower().endswith('.apk') or '.apk?' in url.lower()

def detect_file_download(url: str) -> bool:
    """Check if URL is any file download"""
    download_extensions = ['.apk', '.exe', '.dmg', '.msi', '.deb', '.rpm', 
                          '.zip', '.rar', '.7z', '.tar', '.gz']
    url_lower = url.lower()
    return any(url_lower.endswith(ext) or f'{ext}?' in url_lower for ext in download_extensions)

def guess_content_type(url: str) -> str:
    """Guess the content type based on URL patterns"""
    url_lower = url.lower()
    
    if any(ext in url_lower for ext in ['.apk', '.exe', '.dmg', '.msi']):
        return 'executable_download'
    if any(ext in url_lower for ext in ['.zip', '.rar', '.7z', '.tar']):
        return 'archive_download'
    if any(ext in url_lower for ext in ['.pdf', '.doc', '.docx', '.xls']):
        return 'document'
    if any(word in url_lower for word in ['login', 'signin', 'auth', 'verify']):
        return 'login_page'
    if any(word in url_lower for word in ['pay', 'checkout', 'billing', 'invoice']):
        return 'payment_page'
    if any(word in url_lower for word in ['form', 'register', 'signup']):
        return 'form_page'
    
    return 'webpage'

def determine_intent(signals: dict, url: str) -> tuple[str, str]:
    """Determine the likely intent of the URL"""
    
    if signals['apk_download']:
        return 'malware_distribution', 'Trying to install harmful software'
    
    if signals['brand_impersonation'] and 'login' in url.lower():
        return 'credential_theft', 'Trying to steal your login details'
    
    if signals['payment_request']:
        return 'financial_fraud', 'Attempting to steal your money'
    
    if signals['brand_impersonation']:
        return 'data_harvesting', 'Collecting your personal information'
    
    if signals['short_url'] and signals['http_only']:
        return 'phishing', 'May be hiding a dangerous destination'
    
    # Low risk signals
    risk_count = sum([
        signals['short_url'],
        signals['http_only'],
        signals['redirect_count'] > 2
    ])
    
    if risk_count == 0:
        return 'legitimate', 'Appears to be a legitimate website'
    
    return 'unknown', 'Unable to determine intent'

def calculate_risk_score(signals: dict) -> int:
    """Calculate risk score from 0-100"""
    score = 0
    
    if signals['apk_download']:
        score += 40
    if signals['brand_impersonation']:
        score += 30
    if signals['payment_request']:
        score += 20
    if signals['http_only']:
        score += 15
    if signals['short_url']:
        score += 10
    if signals['domain_age_days'] is not None and signals['domain_age_days'] < 30:
        score += 20
    if signals['redirect_count'] > 2:
        score += 10
    if signals['redirect_count'] > 5:
        score += 10
    
    return min(score, 100)

def determine_risk_level(score: int) -> str:
    """Determine risk level from score"""
    if score < 20:
        return 'safe'
    elif score < 50:
        return 'caution'
    else:
        return 'danger'

def check_virustotal(url: str) -> dict:
    """Check URL reputation using VirusTotal API v3"""
    result = {
        'detected': False,
        'score': 0,
        'checked': False
    }
    
    if not VIRUSTOTAL_API_KEY:
        return result
    
    try:
        # VirusTotal API v3 endpoint
        api_url = 'https://www.virustotal.com/api/v3/urls'
        headers = {
            'x-apikey': VIRUSTOTAL_API_KEY
        }
        
        # First, submit the URL for scanning
        import urllib.parse
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip('=')
        
        # Get URL report
        response = requests.get(
            f'https://www.virustotal.com/api/v3/urls/{url_id}',
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'attributes' in data['data']:
                stats = data['data']['attributes'].get('last_analysis_stats', {})
                malicious = stats.get('malicious', 0)
                suspicious = stats.get('suspicious', 0)
                
                result['checked'] = True
                result['score'] = malicious + suspicious
                result['detected'] = malicious > 0 or suspicious > 0
        elif response.status_code == 404:
            # URL not in database, submit it
            post_response = requests.post(
                api_url,
                headers=headers,
                data={'url': url},
                timeout=10
            )
            # For newly submitted URLs, we can't get immediate results
            result['checked'] = True
            
    except Exception as e:
        # Fail gracefully
        pass
    
    return result

def check_google_safe_browsing(url: str) -> dict:
    """Check URL using Google Safe Browsing API"""
    result = {
        'threat_detected': False,
        'threat_types': [],
        'checked': False
    }
    
    if not GOOGLE_SAFE_BROWSING_API_KEY:
        return result
    
    try:
        api_url = f'https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}'
        
        payload = {
            'client': {
                'clientId': 'safe-scan-lite',
                'clientVersion': '1.0.0'
            },
            'threatInfo': {
                'threatTypes': ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                'platformTypes': ['ANY_PLATFORM'],
                'threatEntryTypes': ['URL'],
                'threatEntries': [
                    {'url': url}
                ]
            }
        }
        
        response = requests.post(api_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result['checked'] = True
            data = response.json()
            
            if 'matches' in data and data['matches']:
                result['threat_detected'] = True
                result['threat_types'] = [match['threatType'] for match in data['matches']]
                
    except Exception as e:
        # Fail gracefully
        pass
    
    return result

def check_reputation(url: str) -> dict:
    """Check URL reputation across multiple threat intelligence sources"""
    reputation = {
        'virustotal_detected': False,
        'virustotal_score': 0,
        'safe_browsing_threat': False,
        'threat_types': [],
        'checked_by': []
    }
    
    # Check VirusTotal
    vt_result = check_virustotal(url)
    if vt_result['checked']:
        reputation['checked_by'].append('VirusTotal')
        reputation['virustotal_detected'] = vt_result['detected']
        reputation['virustotal_score'] = vt_result['score']
    
    # Check Google Safe Browsing
    gsb_result = check_google_safe_browsing(url)
    if gsb_result['checked']:
        reputation['checked_by'].append('Google Safe Browsing')
        reputation['safe_browsing_threat'] = gsb_result['threat_detected']
        reputation['threat_types'] = gsb_result['threat_types']
    
    return reputation

def analyze_url(qr_content: str) -> dict:
    """Main analysis function"""
    
    # Ensure URL has a scheme
    url = qr_content
    if not url.startswith('http://') and not url.startswith('https://'):
        url = f'https://{url}'
    
    signals = {
        'short_url': False,
        'brand_impersonation': False,
        'payment_request': False,
        'apk_download': False,
        'http_only': False,
        'domain_age_days': None,
        'redirect_count': 0
    }
    
    safe_preview = {
        'final_domain': '',
        'https': True,
        'content_type': 'webpage',
        'country': 'Unknown',
        'file_download': False
    }
    
    checked_items = []
    
    # Parse initial URL
    parsed = urlparse(url)
    initial_domain = parsed.netloc
    
    # Check for short URL
    signals['short_url'] = is_short_url(initial_domain)
    checked_items.append('URL shortener detection')
    
    # Follow redirects
    final_url = url
    try:
        response = requests.head(url, allow_redirects=True, timeout=10, 
                                 headers={'User-Agent': 'Mozilla/5.0 SafeScanLite/1.0'})
        final_url = response.url
        signals['redirect_count'] = len(response.history)
        checked_items.append('Redirect behavior')
    except requests.exceptions.Timeout:
        checked_items.append('Redirect behavior (timeout)')
    except requests.exceptions.RequestException:
        checked_items.append('Redirect behavior (failed)')
    
    # Parse final URL
    final_parsed = urlparse(final_url)
    final_domain = final_parsed.netloc
    
    # Update safe preview
    safe_preview['final_domain'] = final_domain
    safe_preview['https'] = final_parsed.scheme == 'https'
    signals['http_only'] = final_parsed.scheme != 'https'
    checked_items.append('HTTPS encryption')
    
    # Check for brand impersonation
    signals['brand_impersonation'] = detect_brand_impersonation(final_domain, final_url)
    checked_items.append('Brand impersonation')
    
    # Check for payment request
    signals['payment_request'] = detect_payment_request(final_url)
    checked_items.append('Payment requests')
    
    # Check for APK/file download
    signals['apk_download'] = detect_apk_download(final_url)
    safe_preview['file_download'] = detect_file_download(final_url)
    checked_items.append('File downloads')
    
    # Guess content type
    safe_preview['content_type'] = guess_content_type(final_url)
    
    # Check for suspicious TLDs
    if any(final_domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
        signals['domain_age_days'] = 10  # Assume new if suspicious TLD
    checked_items.append('Domain reputation')
    
    # Add more checked items
    checked_items.extend([
        'Known scam databases',
        'URL structure analysis',
        'Destination validation'
    ])
    
    # Check reputation via threat intelligence APIs
    reputation = check_reputation(final_url)
    
    # Add reputation check to checked items
    if reputation['checked_by']:
        checked_items.append(f"Reputation databases ({', '.join(reputation['checked_by'])})")
    
    # Adjust risk score based on reputation
    risk_score = calculate_risk_score(signals)
    
    # Increase risk if reputation threats detected
    if reputation['virustotal_detected']:
        risk_score += min(reputation['virustotal_score'] * 3, 30)
    if reputation['safe_browsing_threat']:
        risk_score += 35
    
    risk_score = min(risk_score, 100)
    risk_level = determine_risk_level(risk_score)
    
    # Determine intent
    intent_code, intent_label = determine_intent(signals, final_url)
    
    return {
        'status': 'success',
        'risk': {
            'level': risk_level,
            'score': risk_score
        },
        'intent': {
            'code': intent_code,
            'label': intent_label
        },
        'signals': signals,
        'reputation': reputation,
        'safe_preview': safe_preview,
        'checked_items': checked_items
    }

# ============================================
# API Endpoints
# ============================================

@app.post("/api/scan", response_model=ScanResponse)
async def scan_qr_content(request: ScanRequest):
    """Analyze QR code content for potential threats"""
    if not request.qr_content:
        raise HTTPException(status_code=400, detail="No QR content provided")
    
    try:
        result = analyze_url(request.qr_content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/decode", response_model=DecodeResponse)
async def decode_qr_image(request: DecodeRequest):
    """Decode QR code from base64 image (placeholder - requires additional library)"""
    # Note: Full implementation would require a QR code reading library like pyzbar
    # This is a placeholder that returns an error
    raise HTTPException(
        status_code=501, 
        detail="Server-side QR decoding not implemented. Please decode on client side."
    )

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "safe-scan-lite"
    }

# Keep backwards compatibility with old endpoint
@app.post("/scan")
async def scan_url_legacy(request: ScanRequest):
    """Legacy endpoint - redirects to new API"""
    result = await scan_qr_content(ScanRequest(qr_content=request.qr_content))
    return result

# ============================================
# Run with: uvicorn main:app --reload
# ============================================