import { useEffect } from 'react';

const SERVER_HEALTH_URL = 'https://safe-scan-lite.onrender.com/api/health';
const PING_INTERVAL = 600000; // 10 minutes

/**
 * Custom hook to keep the backend server alive by pinging it every 10 minutes.
 * This prevents Render's free tier from putting the server to sleep after 15 minutes of inactivity.
 */
export const useServerKeepAlive = () => {
    useEffect(() => {
        // Initial ping
        pingServer();

        // Set up interval to ping every 10 minutes
        const intervalId = setInterval(() => {
            pingServer();
        }, PING_INTERVAL);

        // Cleanup interval on unmount
        return () => {
            clearInterval(intervalId);
        };
    }, []);
};

const pingServer = async () => {
    try {
        await fetch(SERVER_HEALTH_URL, {
            method: 'GET',
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        console.log('[KeepAlive] Server pinged successfully');

        // Dispatch success event for monitoring
        window.dispatchEvent(new CustomEvent('keepalive-ping', {
            detail: { success: true, timestamp: Date.now() }
        }));
    } catch (error) {
        // Silently fail - we don't want to disrupt the user experience
        console.warn('[KeepAlive] Ping failed:', error);

        // Dispatch failure event for monitoring
        window.dispatchEvent(new CustomEvent('keepalive-ping', {
            detail: { success: false, timestamp: Date.now() }
        }));
    }
};
