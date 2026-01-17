import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import {
    Home,
    MoreHorizontal,
    ShoppingBag,
    TrendingUp,
    Users,
    DollarSign,
    Calendar,
    Eye,
    EyeOff
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Dashboard() {
    const { orders, getDailySales } = useOrders();
    const { customers } = useCustomers();
    const [activeTab, setActiveTab] = useState<'debt' | 'all'>('debt');
    const [showAmounts, setShowAmounts] = useState(true);

    // 计算统计数据
    const { todaySales, ordersCount } = getDailySales();
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCustomers = customers.length;

    // 过滤赊欠订单（这里假设所有订单都是赊欠，实际应该根据业务逻辑）
    const debtOrders = orders.filter(order => order.status === 'pending');
    const displayOrders = activeTab === 'debt' ? debtOrders : orders;
    const displayGroupedOrders = displayOrders.reduce((acc: Record<string, typeof displayOrders>, order) => {
        const date = order.date.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {});
    const displayDates = Object.keys(displayGroupedOrders).sort((a, b) => b.localeCompare(a));

    const formatCurrency = (amount: number) => {
        return showAmounts ? `¥${amount.toLocaleString()}` : '¥***';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return '今天';
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return '昨天';
        } else {
            return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* 顶部导航栏 */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden">
                                <Home size={20} />
                            </button>
                            <h1 className="text-xl font-bold text-card-foreground">控制台</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAmounts(!showAmounts)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                title={showAmounts ? '隐藏金额' : '显示金额'}
                            >
                                {showAmounts ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="今日销售"
                        value={formatCurrency(todaySales)}
                        trend="up"
                        trendValue="+12.5%"
                        description="较昨日"
                        icon={<DollarSign className="w-5 h-5" />}
                    />
                    <StatsCard
                        title="总销售额"
                        value={formatCurrency(totalSales)}
                        trend="up"
                        trendValue="+8.2%"
                        description="本月累计"
                        icon={<TrendingUp className="w-5 h-5" />}
                    />
                    <StatsCard
                        title="订单数量"
                        value={ordersCount.toString()}
                        trend="up"
                        trendValue="+5"
                        description="今日新增"
                        icon={<ShoppingBag className="w-5 h-5" />}
                    />
                    <StatsCard
                        title="客户总数"
                        value={totalCustomers.toString()}
                        trend="neutral"
                        trendValue="0"
                        description="活跃客户"
                        icon={<Users className="w-5 h-5" />}
                    />
                </div>

                {/* 订单列表 */}
                <div className="bg-card rounded-lg border border-border">
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-card-foreground">订单记录</h2>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">最近订单</span>
                            </div>
                        </div>
                        
                        {/* 标签切换 */}
                        <div className="flex bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('debt')}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'debt'
                                        ? 'bg-card text-card-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-card-foreground'
                                }`}
                            >
                                赊欠订单 ({debtOrders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === 'all'
                                        ? 'bg-card text-card-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-card-foreground'
                                }`}
                            >
                                全部订单 ({orders.length})
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {displayDates.length === 0 ? (
                            <div className="p-8 text-center">
                                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">暂无订单记录</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    去 <span className="text-primary">智能开单</span> 页面创建第一个订单
                                </p>
                            </div>
                        ) : (
                            displayDates.map(date => (
                                <div key={date} className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium text-card-foreground">
                                            {formatDate(date)}
                                        </h3>
                                        <span className="text-sm text-muted-foreground">
                                            {displayGroupedOrders[date].length} 笔订单
                                        </span>
                                    </div>
                                    
                                    {/* 响应式订单列表 */}
                                    <div className="space-y-3">
                                        {displayGroupedOrders[date].map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                        <ShoppingBag className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-card-foreground">
                                                            订单 #{order.id.slice(-6)}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {order.items.length} 个商品
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-card-foreground">
                                                        {formatCurrency(order.totalAmount)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(order.date).toLocaleTimeString('zh-CN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}