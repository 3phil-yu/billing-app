import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Customers from './pages/Customers';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter basename={process.env.NODE_ENV === 'production' ? '/billing-app' : '/'}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="customers" element={<Customers />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div style={{ 
              padding: '4rem', 
              textAlign: 'center',
              color: '#94a3b8'
            }}>404 - Page Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;