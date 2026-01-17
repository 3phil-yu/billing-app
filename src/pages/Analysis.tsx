import { useState } from 'react';
import { analyzeDemand } from '../services/gemini';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { Send, TrendingUp, Sparkles, AlertCircle, BarChart3, Users, ShoppingCart } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';

export default function Analysis() {
    const { orders } = useOrders();
    const { customers } = useCustomers();
    const [apiKey] = useLocalStorage('gemini_api_key', '');
    const { showToast } = useToast();

    const [query, setQuery] = useState('');
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const suggestions = [
        "分析最畅销的产品",
        "预测下周的销售额", 
        "建议营销策略",
        "客户消费行为分析",
        "库存优化建议",
        "季节性销售趋势"
    ];

    const handleAnalysis = async () => {
        if (!query.trim()) {
            showToast({
                type: 'warning',
                title: '请输入分析问题'
            });
            return;
        }

        if (!apiKey) {
            showToast({
                type: 'error',
                title: '缺少API密钥',
                message: '请前往设置页面配置Gemini API密钥'
            });
            return;
        }

        setLoading(true);
        try {
            // 准备分析数据
            const contextData = {
                totalOrders: orders.length,
                totalCustomers: customers.length,
                totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                recentOrders: orders.slice(0, 50), // 最近50个订单
                customerSummary: customers.map(c => ({ 
                    name: c.name, 
                    totalSpent: c.totalSpent,
                    lastOrderDate: c.lastOrderDate 
                })),
                date: new Date().toLocaleDateString('zh-CN')
            };

            const result = await analyzeDemand(contextData, query, apiKey);
            setAnalysis(result);
            
            showToast({
                type: 'success',
                title: '分析完成',
                message: 'AI分析结果已生成'
            });
        } catch (error) {
            console.error(error);
            setAnalysis("生成分析时出错。请检查您的API密钥和网络连接。");
            
            showToast({
                type: 'error',
                title: '分析失败',
                message: '请检查API密钥和网络连接'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAnalysis();
        }
    };

    // 简单的Markdown渲染
    const renderMarkdown = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (line.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold mt-6 mb-3 text-card-foreground">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold mt-8 mb-4 text-card-foreground">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('# ')) {
                return <h1 key={i} className="text-2xl font-bold mt-8 mb-6 text-card-foreground">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={i} className="ml-6 mb-1 text-muted-foreground list-disc">{line.replace(/^[*-] /, '')}</li>;
            }
            if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="mb-3 font-semibold text-card-foreground">{line.replace(/\*\*/g, '')}</p>;
            }
            if (line.trim() === '') {
                return <br key={i} />;
            }
            return <p key={i} className="mb-3 text-muted-foreground leading-relaxed">{line}</p>;
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* 页面头部 */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-card-foreground">AI需求分析</h1>
                            <p className="text-muted-foreground">基于您的业务数据进行智能分析和预测</p>
                        </div>
                    </div>

                    {/* 数据概览 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">总订单数</p>
                                    <p className="text-xl font-bold text-card-foreground">{orders.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <Users className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">客户总数</p>
                                    <p className="text-xl font-bold text-card-foreground">{customers.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-8 h-8 text-purple-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">总销售额</p>
                                    <p className="text-xl font-bold text-card-foreground">
                                        ¥{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API密钥提醒 */}
                    {!apiKey && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                <div>
                                    <p className="font-medium text-yellow-700">需要配置API密钥</p>
                                    <p className="text-sm text-yellow-600">请前往设置页面配置Gemini API密钥以使用AI分析功能</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 分析输入区域 */}
                <div className="bg-card border border-border rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-card-foreground mb-4">提出您的分析问题</h2>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <textarea
                                placeholder="例如：分析最近一周的销售趋势，找出表现最好的产品类别..."
                                className="w-full h-24 p-4 bg-muted/30 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={!apiKey || loading}
                            />
                            <button
                                onClick={handleAnalysis}
                                disabled={loading || !apiKey || !query.trim()}
                                className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="发送分析请求"
                            >
                                {loading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </div>

                        {/* 快速建议 */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-3">快速建议：</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(suggestion => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setQuery(suggestion)}
                                        disabled={!apiKey || loading}
                                        className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 分析结果 */}
                {analysis && (
                    <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <h3 className="text-lg font-semibold text-card-foreground">分析结果</h3>
                        </div>
                        
                        <div className="prose prose-sm max-w-none">
                            {renderMarkdown(analysis)}
                        </div>
                    </div>
                )}

                {/* 加载状态 */}
                {loading && (
                    <div className="bg-card border border-border rounded-lg p-8 text-center">
                        <LoadingSpinner size="lg" text="AI正在分析您的数据..." />
                        <p className="text-sm text-muted-foreground mt-4">
                            这可能需要几秒钟时间，请耐心等待
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
