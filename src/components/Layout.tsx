import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, Settings, Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
    const location = useLocation();
    const menuItems = [
        { path: '/', label: '控制台', icon: LayoutDashboard },
        { path: '/billing', label: '智能开单', icon: Receipt },
        { path: '/customers', label: '客户管理', icon: Users },
        { path: '/analysis', label: '需求分析', icon: Sparkles },
        { path: '/settings', label: '系统设置', icon: Settings },
    ];

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:translate-x-0 glass`}
        >
            <div className="flex items-center justify-between p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    BillingApp
                </h1>
                <button onClick={toggleSidebar} className="md:hidden p-1 rounded-md hover:bg-muted">
                    <Menu size={20} />
                </button>
            </div>

            <nav className="px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="flex md:hidden items-center justify-between p-4 border-b border-border bg-card/50 glass">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md hover:bg-muted">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold">BillingApp</span>
                    <div className="w-8" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
