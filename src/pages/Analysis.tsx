import { useState } from 'react';
import { analyzeDemand } from '../services/gemini';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { Send, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Analysis() {
    const { orders } = useOrders();
    const { customers } = useCustomers();
    const [apiKey] = useLocalStorage('gemini_api_key', '');

    const [query, setQuery] = useState('');
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleAnalysis = async () => {
        if (!query.trim()) return;

        if (!apiKey) {
            setAnalysis("错误: 未找到 API 密钥。请前往设置页面配置您的 Gemini API 密钥。");
            return;
        }

        setLoading(true);
        try {
            // Prepare context for AI
            const contextData = {
                totalOrders: orders.length,
                totalCustomers: customers.length,
                recentOrders: orders.slice(0, 50), // Send last 50 orders to avoid token limits
                customerSummary: customers.map(c => ({ name: c.name, totalSpent: c.totalSpent })),
                date: new Date().toLocaleDateString()
            };

            const result = await analyzeDemand(contextData, query, apiKey);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            setAnalysis("生成分析时出错。请检查您的 API 密钥和网络连接。");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
                    <Sparkles className="text-accent" />
                    需求分析
                </h1>
            </div>

            {!apiKey && (
                <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-center gap-3 text-yellow-500">
                    <AlertCircle size={20} />
                    <p>Gemini API 密钥缺失。请在设置中配置以使用 AI 功能。</p>
                </div>
            )}

            <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
                <p className="text-muted-foreground mb-4">
                    咨询 Gemini 关于您的销售趋势、客户行为或定制报告。
                </p>

                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="例如：解释一下周五销售额下降的原因..."
                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalysis()}
                            disabled={!apiKey}
                        />
                        <button
                            onClick={handleAnalysis}
                            disabled={loading || !apiKey}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {["分析最畅销的产品", "预测下周的销售额", "建议营销策略"].map(suggestion => (
                        <button
                            key={suggestion}
                            onClick={() => setQuery(suggestion)}
                            disabled={!apiKey}
                            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm whitespace-nowrap hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            {analysis && (
                <div className="bg-card border border-border rounded-xl p-8 animate-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-green-500" />
                        分析结果
                    </h3>
                    <div className="prose prose-invert max-w-none">
                        {/* Simple markdown parser for demo */}
                        {analysis.split('\n').map((line, i) => {
                            if (line.startsWith('##')) return <h3 key={i} className="text-xl font-bold mt-6 mb-2">{line.replace('##', '')}</h3>
                            if (line.startsWith('#')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('#', '')}</h2>
                            if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-4 text-muted-foreground">{line.replace(/[*|-]/, '')}</li>
                            return <p key={i} className="mb-2 text-muted-foreground">{line}</p>
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
