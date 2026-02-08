import { useState, useEffect } from 'react';
import './ServerStatusIndicator.css';

interface ServerStatusIndicatorProps {
    show?: boolean; // Whether to show the indicator (default: true in dev, false in prod)
}

export const ServerStatusIndicator = ({ show = import.meta.env.DEV }: ServerStatusIndicatorProps) => {
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [lastPing, setLastPing] = useState<Date | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!show) return;

        let hasReceivedPing = false;
        let offlineTimeout: number;

        // Listen for keep-alive events
        const handleKeepAlive = (event: CustomEvent) => {
            const { success, timestamp } = event.detail;
            hasReceivedPing = true;

            if (success) {
                setStatus('online');
                setLastPing(new Date(timestamp));
                // Clear any pending offline timeout
                if (offlineTimeout) clearTimeout(offlineTimeout);
            } else {
                // Only set to offline after a delay to avoid flickering
                offlineTimeout = setTimeout(() => {
                    setStatus('offline');
                }, 10000); // Wait 10 seconds before showing offline
                setLastPing(new Date(timestamp));
            }
        };

        window.addEventListener('keepalive-ping' as any, handleKeepAlive);

        // After 35 seconds (slightly more than one ping interval), 
        // if we haven't received any ping, something might be wrong
        const initialTimeout = setTimeout(() => {
            if (!hasReceivedPing) {
                console.warn('[StatusIndicator] No keep-alive pings received after 35s');
            }
        }, 35000);

        return () => {
            window.removeEventListener('keepalive-ping' as any, handleKeepAlive);
            if (offlineTimeout) clearTimeout(offlineTimeout);
            clearTimeout(initialTimeout);
        };
    }, [show]);

    if (!show) return null;

    const getStatusColor = () => {
        switch (status) {
            case 'online': return '#10b981'; // green
            case 'offline': return '#ef4444'; // red
            case 'checking': return '#f59e0b'; // amber
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'online': return 'Server Active';
            case 'offline': return 'Server Offline';
            case 'checking': return 'Checking...';
        }
    };

    const formatLastPing = () => {
        if (!lastPing) return 'Never';
        const seconds = Math.floor((Date.now() - lastPing.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    return (
        <div
            className={`server-status-indicator ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            title="Click to expand server status"
        >
            <div className="status-dot" style={{ backgroundColor: getStatusColor() }} />
            <span className="status-text">{getStatusText()}</span>

            {isExpanded && (
                <div className="status-details">
                    <div className="status-detail-item">
                        <span className="detail-label">Last Ping:</span>
                        <span className="detail-value">{formatLastPing()}</span>
                    </div>
                    <div className="status-detail-item">
                        <span className="detail-label">Keep-Alive:</span>
                        <span className="detail-value">Every 30s</span>
                    </div>
                </div>
            )}
        </div>
    );
};
