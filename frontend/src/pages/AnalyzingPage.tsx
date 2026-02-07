import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, QrCode, Globe, ShieldCheck, Loader2 } from 'lucide-react';
import { scanQrContent } from '../api';

interface AnalyzingStep {
    id: string;
    label: string;
    icon: React.ElementType;
    status: 'pending' | 'active' | 'complete';
}

const AnalyzingPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const qrContent = location.state?.qrContent as string;

    const [steps, setSteps] = useState<AnalyzingStep[]>([
        { id: 'decode', label: 'Decoding QR content', icon: QrCode, status: 'pending' },
        { id: 'destination', label: 'Checking destination', icon: Globe, status: 'pending' },
        { id: 'risk', label: 'Analyzing risk factors', icon: ShieldCheck, status: 'pending' },
    ]);

    useEffect(() => {
        if (!qrContent) {
            navigate('/error', { state: { message: 'No QR content to analyze' } });
            return;
        }

        const analyzeContent = async () => {
            // Step 1: Decode
            setSteps(prev => prev.map(s => s.id === 'decode' ? { ...s, status: 'active' } : s));
            await delay(800);
            setSteps(prev => prev.map(s => s.id === 'decode' ? { ...s, status: 'complete' } : s));

            // Step 2: Check destination
            setSteps(prev => prev.map(s => s.id === 'destination' ? { ...s, status: 'active' } : s));
            await delay(600);
            setSteps(prev => prev.map(s => s.id === 'destination' ? { ...s, status: 'complete' } : s));

            // Step 3: Analyze risk
            setSteps(prev => prev.map(s => s.id === 'risk' ? { ...s, status: 'active' } : s));

            try {
                const result = await scanQrContent(qrContent);
                setSteps(prev => prev.map(s => s.id === 'risk' ? { ...s, status: 'complete' } : s));

                await delay(500);
                navigate('/result', { state: { result, qrContent } });
            } catch (error) {
                navigate('/error', { state: { message: 'Analysis failed. Please try again.' } });
            }
        };

        analyzeContent();
    }, [qrContent, navigate]);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <div className="page-container analyzing-page">
            {/* Animated Background */}
            <div className="analyzing-background">
                <motion.div
                    className="pulse-ring"
                    animate={{
                        scale: [1, 2, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="pulse-ring delay-1"
                    animate={{
                        scale: [1, 2, 1],
                        opacity: [0.3, 0, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />
            </div>

            <motion.div
                className="analyzing-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Central Icon */}
                <motion.div
                    className="analyzing-icon-wrapper"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                    <Shield size={48} className="analyzing-icon" />
                </motion.div>

                <h1 className="analyzing-title">Analyzing QR Code</h1>
                <p className="analyzing-subtitle">Please wait while we check for threats...</p>

                {/* Steps Progress */}
                <div className="steps-progress">
                    <AnimatePresence>
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                className={`step-item ${step.status}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="step-icon-container">
                                    {step.status === 'active' ? (
                                        <Loader2 className="step-icon spin" size={24} />
                                    ) : step.status === 'complete' ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="step-checkmark"
                                        >
                                            ✓
                                        </motion.div>
                                    ) : (
                                        <step.icon className="step-icon" size={24} />
                                    )}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* URL Preview */}
                {qrContent && (
                    <motion.div
                        className="url-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className="url-preview-label">Checking:</span>
                        <span className="url-preview-value">{qrContent.slice(0, 50)}{qrContent.length > 50 ? '...' : ''}</span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default AnalyzingPage;
