import axios from 'axios';
import type { ScanResponse, DecodeResponse, HealthResponse } from './types';

const API_BASE = 'https://safe-scan-lite.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 60000, // Increased to 60s to handle Render cold starts
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function scanQrContent(qrContent: string): Promise<ScanResponse> {
    try {
        const response = await api.post<ScanResponse>('/scan', { qr_content: qrContent });
        return response.data;
    } catch (error: any) {
        // Retry once if it's a timeout or network error
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error')) {
            console.log('[Retry] First attempt failed, retrying in 2 seconds...');

            // Wait 2 seconds before retry
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                console.log('[Retry] Attempting second request...');
                const response = await api.post<ScanResponse>('/scan', { qr_content: qrContent });
                console.log('[Retry] Second attempt successful!');
                return response.data;
            } catch (retryError) {
                console.error('[Retry] Second attempt also failed');
                throw retryError;
            }
        }

        // If it's not a retryable error, throw immediately
        throw error;
    }
}

export async function decodeQrImage(imageBase64: string): Promise<DecodeResponse> {
    const response = await api.post<DecodeResponse>('/decode', { image_base64: imageBase64 });
    return response.data;
}

export async function healthCheck(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
}

export default api;
