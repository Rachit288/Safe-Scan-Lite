import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ScanPage from './pages/ScanPage';
import AnalyzingPage from './pages/AnalyzingPage';
import ResultPage from './pages/ResultPage';
import ErrorPage from './pages/ErrorPage';
import LearnPage from './pages/LearnPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/scan',
        element: <ScanPage />,
    },
    {
        path: '/analyzing',
        element: <AnalyzingPage />,
    },
    {
        path: '/result',
        element: <ResultPage />,
    },
    {
        path: '/error',
        element: <ErrorPage />,
    },
    {
        path: '/learn',
        element: <LearnPage />,
    },
]);
