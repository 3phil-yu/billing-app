

export default function TestComponent() {
    return (
        <div style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '1rem',
            textAlign: 'center',
            color: 'white'
        }}>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                background: 'linear-gradient(90deg, #93c5fd, #c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                ✅ 设计更新验证
            </h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#94a3b8' }}>
                这是一个测试组件，用于验证新设计是否正确应用。
            </p>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
            }}>
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: '#93c5fd', marginBottom: '0.5rem' }}>
                        🎨 新设计
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        渐变背景和现代化布局
                    </p>
                </div>
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: '#93c5fd', marginBottom: '0.5rem' }}>
                        🔧 技术
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        React + TypeScript + Vite
                    </p>
                </div>
                <div style={{
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ color: '#93c5fd', marginBottom: '0.5rem' }}>
                        📱 移动
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        响应式设计
                    </p>
                </div>
            </div>
        </div>
    );
}