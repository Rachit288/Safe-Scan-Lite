import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

const ErrorPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const errorMessage = location.state?.message || 'Something went wrong';

    return (
        <div className="page-container error-page">
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
                className="error-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <motion.div
                    className="error-icon-wrapper"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                    <AlertCircle size={64} className="error-icon" />
                </motion.div>

                <motion.h1
                    className="error-title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Oops! Something Went Wrong
                </motion.h1>

                <motion.p
                    className="error-message"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {errorMessage}
                </motion.p>

                <motion.div
                    className="error-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.button
                        className="action-button primary"
                        onClick={() => navigate('/scan')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw size={18} />
                        Try Again
                    </motion.button>
                    <motion.button
                        className="action-button secondary"
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Home size={18} />
                        Back to Home
                    </motion.button>
                </motion.div>

                <motion.div
                    className="error-tips"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <h3>Tips to resolve this:</h3>
                    <ul>
                        <li>Make sure the QR code is clear and not damaged</li>
                        <li>Try taking the photo in better lighting</li>
                        <li>Make sure the QR code contains a valid URL</li>
                        <li>Try uploading an image instead of using camera</li>
                    </ul>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ErrorPage;
