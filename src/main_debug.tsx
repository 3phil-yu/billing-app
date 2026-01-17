import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Test Component to isolate issues
function TestApp() {
    return (
        <div style={{ padding: '20px', background: '#333', color: '#fff', minHeight: '100vh' }}>
            <h1>System Check</h1>
            <p>React is mounting correctly.</p>
            <p>If you see this, the issue is inside App.tsx or its children.</p>
        </div>
    )
}

export default TestApp;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TestApp />
    </StrictMode>,
)
