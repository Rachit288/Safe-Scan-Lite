import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Scan, Search, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const steps = [
        { icon: Scan, title: 'Scan', description: 'Point your camera at any QR code' },
        { icon: Search, title: 'Analyze', description: 'We check for hidden threats' },
        { icon: CheckCircle, title: 'Understand', description: 'Get clear, simple results' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    } as const;

    return (
        <div className="page-container">
            {/* Animated Background Orbs */}
            <div className="background-orbs">
                <motion.div
                    className="orb orb-1"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="orb orb-2"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="orb orb-3"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, 50, 0],
                        scale: [1, 0.9, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Navigation */}
            <motion.nav
                className="nav-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="nav-logo">
                    <Shield className="nav-logo-icon" />
                    <span>Safe-Scan Lite</span>
                </div>
                <div className="nav-links">
                    <Link to="/learn" className="nav-link">Learn</Link>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <motion.div
                className="hero-section"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="hero-badge" variants={itemVariants}>
                    <Sparkles size={16} />
                    <span>Free & Privacy-First</span>
                </motion.div>

                <motion.h1 className="hero-title" variants={itemVariants}>
                    Scan QR Codes <br />
                    <span className="gradient-text">Safely Before Opening</span>
                </motion.h1>

                <motion.p className="hero-subtitle" variants={itemVariants}>
                    Don't let hidden links trick you. We analyze QR codes for phishing,
                    scams, and malware so you can browse with confidence.
                </motion.p>

                <motion.button
                    className="cta-button"
                    variants={itemVariants}
                    onClick={() => navigate('/scan')}
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Scan size={20} />
                    Scan a QR Code
                    <ArrowRight size={18} />
                </motion.button>
            </motion.div>

            {/* Steps Section */}
            <motion.div
                className="steps-section"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
            >
                <h2 className="steps-title">How It Works</h2>
                <div className="steps-grid">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            className="step-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 + index * 0.15 }}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
                        >
                            <div className="step-number">{index + 1}</div>
                            <div className="step-icon-wrapper">
                                <step.icon size={28} />
                            </div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
                className="trust-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
            >
                <div className="trust-item">
                    <CheckCircle size={18} className="trust-icon" />
                    <span>No data stored</span>
                </div>
                <div className="trust-item">
                    <CheckCircle size={18} className="trust-icon" />
                    <span>Works offline</span>
                </div>
                <div className="trust-item">
                    <CheckCircle size={18} className="trust-icon" />
                    <span>100% free</span>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
