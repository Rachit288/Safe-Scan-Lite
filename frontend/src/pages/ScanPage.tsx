import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Shield, Camera, Upload, Type, ArrowLeft, Loader2 } from 'lucide-react';

type InputMode = 'camera' | 'upload' | 'manual';

const ScanPage = () => {
    const navigate = useNavigate();
    const [inputMode, setInputMode] = useState<InputMode>('camera');
    const [manualUrl, setManualUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startScanner = async () => {
        if (scannerRef.current) return;

        try {
            const html5Qrcode = new Html5Qrcode('qr-reader');
            scannerRef.current = html5Qrcode;

            await html5Qrcode.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                () => { /* QR code scanning is in progress */ }
            );
            setIsScanning(true);
            setCameraError(null);
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError('Unable to access camera. Please try uploading an image or entering URL manually.');
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (e) {
                console.warn('Scanner stop warning:', e);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    useEffect(() => {
        if (inputMode === 'camera') {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [inputMode]);

    const handleScanSuccess = (qrContent: string) => {
        stopScanner();
        // Navigate to analyzing page with the QR content
        navigate('/analyzing', { state: { qrContent } });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const html5Qrcode = new Html5Qrcode('qr-file-reader');
            const result = await html5Qrcode.scanFile(file, true);
            handleScanSuccess(result);
        } catch {
            navigate('/error', { state: { message: 'Could not read QR code from image. Please try a clearer image.' } });
        }
    };

    const handleManualSubmit = () => {
        if (!manualUrl.trim()) return;

        let processedUrl = manualUrl.trim();
        if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
            processedUrl = `https://${processedUrl}`;
        }

        handleScanSuccess(processedUrl);
    };

    const inputModes = [
        { id: 'camera' as InputMode, icon: Camera, label: 'Camera' },
        { id: 'upload' as InputMode, icon: Upload, label: 'Upload' },
        { id: 'manual' as InputMode, icon: Type, label: 'Manual' },
    ];

    return (
        <div className="page-container scan-page">
            {/* Navigation */}
            <motion.nav
                className="nav-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link to="/" className="nav-back">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </Link>
                <div className="nav-logo">
                    <Shield className="nav-logo-icon" />
                    <span>Safe-Scan Lite</span>
                </div>
                <div style={{ width: '80px' }} /> {/* Spacer for centering */}
            </motion.nav>

            <motion.div
                className="scan-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h1 className="scan-title">Scan QR Code</h1>
                <p className="scan-subtitle">Choose how you want to input the QR code</p>

                {/* Input Mode Selector */}
                <div className="mode-selector">
                    {inputModes.map((mode) => (
                        <motion.button
                            key={mode.id}
                            className={`mode-button ${inputMode === mode.id ? 'active' : ''}`}
                            onClick={() => setInputMode(mode.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <mode.icon size={20} />
                            <span>{mode.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* Scanner Area */}
                <AnimatePresence mode="wait">
                    {inputMode === 'camera' && (
                        <motion.div
                            key="camera"
                            className="scanner-container"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            {cameraError ? (
                                <div className="camera-error">
                                    <p>{cameraError}</p>
                                </div>
                            ) : (
                                <>
                                    <div id="qr-reader" className="qr-reader" />
                                    {isScanning && (
                                        <div className="scanning-indicator">
                                            <Loader2 className="spin" size={20} />
                                            <span>Scanning...</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}

                    {inputMode === 'upload' && (
                        <motion.div
                            key="upload"
                            className="upload-container"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div id="qr-file-reader" style={{ display: 'none' }} />
                            <motion.div
                                className="upload-dropzone"
                                whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={48} className="upload-icon" />
                                <p className="upload-text">Click to upload QR code image</p>
                                <p className="upload-hint">PNG, JPG, or GIF</p>
                            </motion.div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </motion.div>
                    )}

                    {inputMode === 'manual' && (
                        <motion.div
                            key="manual"
                            className="manual-container"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="manual-input-group">
                                <input
                                    type="text"
                                    className="manual-input"
                                    placeholder="Enter URL or text from QR code..."
                                    value={manualUrl}
                                    onChange={(e) => setManualUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                                />
                                <motion.button
                                    className="manual-submit"
                                    onClick={handleManualSubmit}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!manualUrl.trim()}
                                >
                                    Analyze
                                </motion.button>
                            </div>
                            <p className="manual-hint">We'll check this URL for potential threats</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ScanPage;
