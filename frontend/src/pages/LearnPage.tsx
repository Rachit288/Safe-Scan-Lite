import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Shield, ArrowLeft, QrCode, AlertTriangle, ShieldCheck,
    Eye, Phone, CreditCard, Download, Globe, ExternalLink
} from 'lucide-react';

const LearnPage = () => {
    const scamTypes = [
        {
            icon: CreditCard,
            title: 'Payment Scams',
            description: 'QR codes that lead to fake payment pages or request cryptocurrency transfers.',
            tip: 'Never scan QR codes for payments from unknown sources.',
        },
        {
            icon: Eye,
            title: 'Phishing Attacks',
            description: 'Fake login pages that steal your username and password.',
            tip: 'Always verify the website domain before entering credentials.',
        },
        {
            icon: Download,
            title: 'Malware Downloads',
            description: 'QR codes that trigger automatic downloads of harmful apps.',
            tip: 'Only install apps from official app stores.',
        },
        {
            icon: Globe,
            title: 'Redirect Chains',
            description: 'Multiple redirects to hide the final malicious destination.',
            tip: 'Be suspicious of shortened URLs that bounce through many sites.',
        },
    ];

    const safetyTips = [
        'Preview URLs before opening - use Safe-Scan Lite!',
        'Check for HTTPS and valid security certificates',
        'Be wary of QR codes in public places or unsolicited emails',
        'Never enter personal info on sites reached via QR codes without verification',
        'Keep your device and apps updated',
        'Report suspicious QR codes to local authorities',
    ];

    return (
        <div className="page-container learn-page">
            {/* Navigation */}
            <motion.nav
                className="nav-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link to="/" className="nav-back">
                    <ArrowLeft size={20} />
                    <span>Home</span>
                </Link>
                <div className="nav-logo">
                    <Shield className="nav-logo-icon" />
                    <span>Safe-Scan Lite</span>
                </div>
                <div style={{ width: '80px' }} />
            </motion.nav>

            <motion.div
                className="learn-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {/* Hero */}
                <div className="learn-hero">
                    <motion.div
                        className="learn-hero-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                    >
                        <QrCode size={48} />
                    </motion.div>
                    <h1>Understanding QR Code Scams</h1>
                    <p>Learn how to protect yourself from malicious QR codes</p>
                </div>

                {/* Scam Types */}
                <section className="learn-section">
                    <h2>
                        <AlertTriangle size={24} />
                        Common QR Code Scams
                    </h2>
                    <div className="scam-types-grid">
                        {scamTypes.map((scam, index) => (
                            <motion.div
                                key={scam.title}
                                className="scam-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)' }}
                            >
                                <div className="scam-card-icon">
                                    <scam.icon size={28} />
                                </div>
                                <h3>{scam.title}</h3>
                                <p className="scam-description">{scam.description}</p>
                                <div className="scam-tip">
                                    <ShieldCheck size={16} />
                                    <span>{scam.tip}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Safety Tips */}
                <motion.section
                    className="learn-section safety-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <h2>
                        <ShieldCheck size={24} />
                        Stay Safe: Best Practices
                    </h2>
                    <div className="safety-tips-list">
                        {safetyTips.map((tip, index) => (
                            <motion.div
                                key={index}
                                className="safety-tip"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 + index * 0.05 }}
                            >
                                <span className="tip-number">{index + 1}</span>
                                <span className="tip-text">{tip}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Real World Examples */}
                <motion.section
                    className="learn-section examples-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                >
                    <h2>
                        <Phone size={24} />
                        Real-World Examples
                    </h2>
                    <div className="examples-grid">
                        <div className="example-card warning">
                            <h4>Parking Meter Scams</h4>
                            <p>Criminals place fake QR codes over legitimate parking payment terminals, redirecting payments to their accounts.</p>
                        </div>
                        <div className="example-card warning">
                            <h4>Restaurant Menu Phishing</h4>
                            <p>Fake QR codes on tables that mimic restaurant menus but actually collect personal information.</p>
                        </div>
                        <div className="example-card warning">
                            <h4>Package Delivery Scams</h4>
                            <p>QR codes on fake delivery notices that lead to phishing sites requesting payment for "redelivery fees."</p>
                        </div>
                    </div>
                </motion.section>

                {/* CTA */}
                <motion.div
                    className="learn-cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                >
                    <h3>Ready to scan safely?</h3>
                    <Link to="/scan" className="cta-button">
                        <QrCode size={20} />
                        Start Scanning
                        <ExternalLink size={16} />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LearnPage;
