import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

// --- Types ---
interface ScanResult {
  original_url: string;
  final_url: string;
  risk_level: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
  messages: string[];
}

function App() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize QR Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, (err) => console.warn(err));

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner. ", error));
    };
  }, []);

  const analyzeUrl = async (url: string) => {
    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      // Validate string is roughly a URL before sending
      if (!url.includes('.') && !url.includes('http')) {
        throw new Error("Scanned text does not look like a URL.");
      }

      // Add http if missing for the backend logic
      const processUrl = url.startsWith('http') ? url : `http://${url}`;

      const response = await axios.post('http://127.0.0.1:8000/scan', {
        url: processUrl
      });
      setScanResult(response.data);
    } catch (err) {
      setError("Could not analyze URL. The server might be offline or the QR code is not a valid link.");
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (decodedText: string) => {
    // Determine if we should auto-scan (simple debounce or check if already loading)
    if (!loading) {
        analyzeUrl(decodedText);
    }
  };

  // --- Helper for UI Colors ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAFE': return 'bg-green-100 border-green-500 text-green-800';
      case 'CAUTION': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'HIGH_RISK': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Safe-Scan Lite 🛡️</h1>
        <p className="text-gray-600">Scan QR codes to detect phishing before you click.</p>
      </header>

      {/* --- Scanner Section --- */}
      <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-md mb-6">
        <div id="reader" className="w-full"></div>
        
        <div className="mt-4 flex gap-2">
          <input 
            type="text" 
            placeholder="Or paste URL here..." 
            className="flex-1 border p-2 rounded"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
          />
          <button 
            onClick={() => analyzeUrl(manualUrl)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Check
          </button>
        </div>
      </div>

      {/* --- Results Section --- */}
      {loading && (
        <div className="animate-pulse text-blue-600 font-semibold">
          🔍 Analyzing security risks...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md w-full border border-red-200">
          {error}
        </div>
      )}

      {scanResult && (
        <div className={`w-full max-w-md p-6 rounded-xl border-l-4 shadow-lg ${getStatusColor(scanResult.risk_level)}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{scanResult.risk_level.replace('_', ' ')}</h2>
            <span className="text-3xl">
              {scanResult.risk_level === 'SAFE' ? '✅' : scanResult.risk_level === 'CAUTION' ? '⚠️' : '🚫'}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-semibold opacity-75">Final Destination:</p>
            <p className="font-mono text-sm break-all">{scanResult.final_url}</p>
          </div>

          <div className="bg-white/50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Analysis Report:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {scanResult.messages.map((msg, idx) => (
                <li key={idx} className="text-sm">{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;