import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, Settings, Sparkles } from 'lucide-react';

export default function Layout() {
    const location = useLocation();
    const menuItems = [
        { path: '/', label: '对账单', icon: LayoutDashboard },
        { path: '/billing', label: '智能开单', icon: Receipt },
        { path: '/customers', label: '客户管理', icon: Users },
        { path: '/analysis', label: '需求分析', icon: Sparkles },
        { path: '/settings', label: '系统设置', icon: Settings },
    ];

    // 检查是否为开单页面
    const isBillingPage = location.pathname === '/billing';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}>
            {/* 顶部导航栏 - 移动端 (仅在非开单页面显示) */}
            {!isBillingPage && (
                <header style={{
                    padding: '1rem 1rem',
                    background: 'linear-gradient(to right, #1e1b4b, #4c1d95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Receipt size={20} style={{ color: 'white' }} />
                        </div>
                        <h1 style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(90deg, #93c5fd, #c4b5fd)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        智能开单
                    </h1>
                    </div>
                    <div style={{ width: '2.5rem' }} />
                </header>
            )}

            {/* 主内容区域 */}
            <main style={{
                flex: 1,
                overflow: 'auto',
                padding: '1.5rem',
                paddingBottom: '8rem'
            }} className="lg:p-8 lg:pb-8">
                <Outlet />
            </main>

            {/* 底部导航栏 - 移动端 */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to right, #1e1b4b, #4c1d95)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 40,
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)'
            }} className="lg:hidden">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.5rem',
                                borderRadius: '0.75rem',
                                textDecoration: 'none',
                                transition: 'all 0.3s',
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                color: isActive ? '#93c5fd' : '#94a3b8',
                                minWidth: '4rem'
                            }}
                        >
                            <div style={{
                                width: '2rem',
                                height: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isActive ? '#93c5fd' : '#94a3b8'
                            }}>
                                <Icon size={20} />
                            </div>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: isActive ? '500' : '400' 
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* 桌面端侧边栏 */}
            <nav style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: '18rem',
                background: 'linear-gradient(to bottom, #1e1b4b, #4c1d95)',
                padding: '2rem 1rem',
                display: 'none',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 50,
                boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)'
            }} className="lg:flex">
                <div style={{
                    padding: '0 1rem 2rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            <Receipt size={20} style={{ color: 'white' }} />
                        </div>
                        <h1 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            background: 'linear-gradient(90deg, #93c5fd, #c4b5fd)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            智能开单
                        </h1>
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '1rem',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                    color: isActive ? 'white' : '#94a3b8',
                                    fontWeight: isActive ? '500' : '400',
                                    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                                }}
                            >
                                <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                    color: isActive ? '#93c5fd' : '#94a3b8'
                                }}>
                                    <Icon size={22} />
                                </div>
                                <span style={{ fontSize: '1rem', fontWeight: '500' }}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div style={{
                                        marginLeft: 'auto',
                                        width: '0.5rem',
                                        height: '0.5rem',
                                        borderRadius: '50%',
                                        background: '#93c5fd',
                                        animation: 'pulse 2s infinite'
                                    }} />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div style={{
                    padding: '1.5rem 1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
                        智能开单系统 v1.0
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0' }}>
                        © 2024 BillingApp
                    </p>
                </div>
            </nav>
        </div>
    );
}