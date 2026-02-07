import axios from 'axios';
import type { ScanResponse, DecodeResponse, HealthResponse } from './types';

const API_BASE = 'https://safe-scan-lite.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export async function scanQrContent(qrContent: string): Promise<ScanResponse> {
    const response = await api.post<ScanResponse>('/scan', { qr_content: qrContent });
    return response.data;
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
