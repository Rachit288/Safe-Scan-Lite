import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    Shield, ShieldCheck, ShieldAlert, ShieldX,
    AlertTriangle, Link as LinkIcon, Globe, Clock,
    ExternalLink, RefreshCw, ArrowLeft, Eye, CheckCircle2,
    Info, Lock, Unlock, Database
} from 'lucide-react';
import type { ScanResponse } from '../types';
import { signalExplanations } from '../types';

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result as ScanResponse | undefined;
    const qrContent = location.state?.qrContent as string;

    if (!result) {
        navigate('/error', { state: { message: 'No results to display' } });
        return null;
    }

    const { risk, intent, signals, reputation, safe_preview, checked_items } = result;

    const riskConfig = useMemo(() => {
        switch (risk.level) {
            case 'safe':
                return {
                    icon: ShieldCheck,
                    color: 'var(--success)',
                    bgColor: 'var(--success-bg)',
                    label: 'Safe',
                    message: 'This link appears to be safe',
                };
            case 'caution':
                return {
                    icon: ShieldAlert,
                    color: 'var(--warning)',
                    bgColor: 'var(--warning-bg)',
                    label: 'Caution',
                    message: 'Proceed with caution',
                };
            case 'danger':
                return {
                    icon: ShieldX,
                    color: 'var(--danger)',
                    bgColor: 'var(--danger-bg)',
                    label: 'Danger',
                    message: 'This link may be harmful',
                };
            default:
                return {
                    icon: Shield,
                    color: 'var(--text-secondary)',
                    bgColor: 'var(--surface)',
                    label: 'Unknown',
                    message: 'Unable to determine risk',
                };
        }
    }, [risk.level]);

    const RiskIcon = riskConfig.icon;

    // Build active signals for display
    const activeSignals = useMemo(() => {
        const active: { key: string; explanation: { simple: string; normal: string } }[] = [];

        if (signals.short_url) active.push({ key: 'short_url', explanation: signalExplanations.short_url });
        if (signals.brand_impersonation) active.push({ key: 'brand_impersonation', explanation: signalExplanations.brand_impersonation });
        if (signals.payment_request) active.push({ key: 'payment_request', explanation: signalExplanations.payment_request });
        if (signals.apk_download) active.push({ key: 'apk_download', explanation: signalExplanations.apk_download });
        if (signals.http_only) active.push({ key: 'http_only', explanation: signalExplanations.http_only });
        if (signals.domain_age_days !== null && signals.domain_age_days < 30) {
            active.push({ key: 'domain_age_new', explanation: signalExplanations.domain_age_new });
        }
        if (signals.redirect_count > 2) {
            active.push({ key: 'redirect_excessive', explanation: signalExplanations.redirect_excessive });
        }

        return active;
    }, [signals]);

    return (
        <div className="page-container result-page">
            {/* Navigation */}
            <motion.nav
                className="nav-bar"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link to="/scan" className="nav-back">
                    <ArrowLeft size={20} />
                    <span>Scan Again</span>
                </Link>
                <div className="nav-logo">
                    <Shield className="nav-logo-icon" />
                    <span>Safe-Scan Lite</span>
                </div>
                <div style={{ width: '100px' }} />
            </motion.nav>

            <div className="result-content">
                {/* Risk Header */}
                <motion.div
                    className="risk-header"
                    style={{ backgroundColor: riskConfig.bgColor, borderColor: riskConfig.color }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div
                        className="risk-icon-wrapper"
                        style={{ backgroundColor: riskConfig.color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <RiskIcon size={36} color="white" />
                    </motion.div>

                    <div className="risk-info">
                        <h1 className="risk-label" style={{ color: riskConfig.color }}>{riskConfig.label}</h1>
                        <p className="risk-message">{riskConfig.message}</p>
                    </div>

                    <motion.div
                        className="risk-score"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="score-value" style={{ color: riskConfig.color }}>{risk.score}</span>
                        <span className="score-label">Risk Score</span>
                    </motion.div>
                </motion.div>

                {/* Intent Badge */}
                <motion.div
                    className="intent-badge"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <AlertTriangle size={18} />
                    <span>{intent.label}</span>
                </motion.div>

                {/* Main Grid */}
                <div className="result-grid">
                    {/* Signals Panel - "Why You Were Targeted" */}
                    {activeSignals.length > 0 && (
                        <motion.div
                            className="result-panel signals-panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="panel-header">
                                <AlertTriangle size={20} />
                                <h3>Why This Might Be Dangerous</h3>
                            </div>
                            <div className="signals-list">
                                {activeSignals.map((signal, index) => (
                                    <motion.div
                                        key={signal.key}
                                        className="signal-item"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                    >
                                        <Info size={16} className="signal-icon" />
                                        <div className="signal-text">
                                            <p className="signal-simple">{signal.explanation.simple}</p>
                                            <p className="signal-normal">{signal.explanation.normal}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Safe Preview Panel */}
                    <motion.div
                        className="result-panel preview-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="panel-header">
                            <Eye size={20} />
                            <h3>Safe Preview</h3>
                        </div>
                        <div className="preview-content">
                            <div className="preview-item">
                                <Globe size={18} />
                                <span className="preview-label">Final Domain:</span>
                                <span className="preview-value">{safe_preview.final_domain}</span>
                            </div>
                            <div className="preview-item">
                                {safe_preview.https ? <Lock size={18} className="secure" /> : <Unlock size={18} className="insecure" />}
                                <span className="preview-label">Connection:</span>
                                <span className={`preview-value ${safe_preview.https ? 'secure' : 'insecure'}`}>
                                    {safe_preview.https ? 'Secure (HTTPS)' : 'Not Secure (HTTP)'}
                                </span>
                            </div>
                            <div className="preview-item">
                                <LinkIcon size={18} />
                                <span className="preview-label">Content Type:</span>
                                <span className="preview-value">{safe_preview.content_type}</span>
                            </div>
                            {signals.redirect_count > 0 && (
                                <div className="preview-item">
                                    <RefreshCw size={18} />
                                    <span className="preview-label">Redirects:</span>
                                    <span className="preview-value">{signals.redirect_count} redirect(s)</span>
                                </div>
                            )}
                            {signals.domain_age_days !== null && (
                                <div className="preview-item">
                                    <Clock size={18} />
                                    <span className="preview-label">Domain Age:</span>
                                    <span className="preview-value">{signals.domain_age_days} days</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Reputation Panel - Shows Threat Intelligence Results */}
                    {reputation && reputation.checked_by.length > 0 && (
                        <motion.div
                            className="result-panel reputation-panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                        >
                            <div className="panel-header">
                                <Database size={20} />
                                <h3>Reputation Check</h3>
                            </div>
                            <div className="reputation-content">
                                {reputation.checked_by.map((source, index) => (
                                    <motion.div
                                        key={source}
                                        className="reputation-item"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                    >
                                        <div className="reputation-source">
                                            <CheckCircle2 size={16} className="source-icon" />
                                            <span className="source-name">{source}</span>
                                        </div>
                                        {source === 'VirusTotal' && (
                                            <div className="reputation-details">
                                                {reputation.virustotal_detected ? (
                                                    <>
                                                        <span className="threat-badge danger">
                                                            ⚠️ Threats Detected
                                                        </span>
                                                        <span className="threat-score">
                                                            {reputation.virustotal_score} security vendor{reputation.virustotal_score !== 1 ? 's' : ''} flagged this URL
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="threat-badge safe">
                                                        ✓ No threats found
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {source === 'Google Safe Browsing' && (
                                            <div className="reputation-details">
                                                {reputation.safe_browsing_threat ? (
                                                    <>
                                                        <span className="threat-badge danger">
                                                            ⚠️ Threats Detected
                                                        </span>
                                                        {reputation.threat_types.length > 0 && (
                                                            <div className="threat-types">
                                                                {reputation.threat_types.map((type, i) => (
                                                                    <span key={i} className="threat-type-tag">
                                                                        {type.replace('_', ' ')}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="threat-badge safe">
                                                        ✓ No threats found
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Transparency Panel */}
                    <motion.div
                        className="result-panel transparency-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="panel-header">
                            <CheckCircle2 size={20} />
                            <h3>We Checked This So You Don't Have To</h3>
                        </div>
                        <div className="checked-list">
                            {checked_items.map((item, index) => (
                                <motion.div
                                    key={item}
                                    className="checked-item"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 + index * 0.05 }}
                                >
                                    <CheckCircle2 size={16} className="check-icon" />
                                    <span>{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Original URL */}
                <motion.div
                    className="original-url"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                    <span className="url-label">Original QR Content:</span>
                    <code className="url-value">{qrContent}</code>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    className="action-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <motion.button
                        className="action-button secondary"
                        onClick={() => navigate('/scan')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw size={18} />
                        Scan Another
                    </motion.button>
                    {risk.level === 'safe' && (
                        <motion.a
                            className="action-button primary"
                            href={qrContent}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ExternalLink size={18} />
                            Visit Link
                        </motion.a>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ResultPage;
