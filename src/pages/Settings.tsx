import { useState, useEffect } from 'react';
import { Save, Trash2, Key, AlertTriangle, Eye, EyeOff, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';

export default function Settings() {
    const [apiKey, setApiKey] = useLocalStorage('gemini_api_key', '');
    const [inputValue, setInputValue] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        setInputValue(apiKey);
    }, [apiKey]);

    const handleSave = () => {
        if (!inputValue.trim()) {
            showToast({
                type: 'warning',
                title: '请输入API密钥'
            });
            return;
        }

        if (!inputValue.startsWith('AIza')) {
            showToast({
                type: 'warning',
                title: 'API密钥格式不正确',
                message: 'Gemini API密钥应以"AIza"开头'
            });
            return;
        }

        setApiKey(inputValue);
        showToast({
            type: 'success',
            title: '设置已保存',
            message: 'API密钥配置成功'
        });
    };

    const handleReset = () => {
        // 清除所有本地存储数据
        const keysToRemove = [
            'billing_orders',
            'billing_customers', 
            'billing_frequent_goods',
            'billing_frequent_customers',
            'gemini_api_key'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        setShowResetModal(false);
        
        showToast({
            type: 'success',
            title: '数据重置成功',
            message: '所有数据已清除，页面将刷新'
        });

        // 延迟刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const maskApiKey = (key: string) => {
        if (!key) return '';
        if (key.length <= 8) return '*'.repeat(key.length);
        return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* 页面头部 */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <SettingsIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-card-foreground">系统设置</h1>
                            <p className="text-muted-foreground">配置应用参数和管理数据</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* API配置 */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-card-foreground">API配置</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="api-key" className="block text-sm font-medium text-card-foreground mb-2">
                                    Google Gemini API密钥
                                </label>
                                <div className="relative">
                                    <input
                                        id="api-key"
                                        type={showApiKey ? 'text' : 'password'}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="请输入您的Gemini API密钥 (AIzaSy...)"
                                        className="w-full pr-20 pl-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    />
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                                            title={showApiKey ? '隐藏密钥' : '显示密钥'}
                                        >
                                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {apiKey && (
                                    <div className="mt-2 flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-muted-foreground">
                                            当前密钥: {maskApiKey(apiKey)}
                                        </span>
                                    </div>
                                )}
                                
                                <p className="mt-2 text-sm text-muted-foreground">
                                    用于OCR图片识别和AI需求分析功能。
                                    <a 
                                        href="https://makersuite.google.com/app/apikey" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline ml-1"
                                    >
                                        获取API密钥
                                    </a>
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                <Save size={18} />
                                保存配置
                            </button>
                        </div>
                    </div>

                    {/* 应用信息 */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-card-foreground mb-4">应用信息</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">应用版本:</span>
                                <span className="ml-2 font-medium text-card-foreground">v1.0.0</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">构建时间:</span>
                                <span className="ml-2 font-medium text-card-foreground">2024-01-17</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">技术栈:</span>
                                <span className="ml-2 font-medium text-card-foreground">React + TypeScript + Vite</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">AI引擎:</span>
                                <span className="ml-2 font-medium text-card-foreground">Google Gemini</span>
                            </div>
                        </div>
                    </div>

                    {/* 数据管理 */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-card-foreground mb-4">数据管理</h2>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-medium text-card-foreground mb-2">数据存储</h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    所有数据存储在浏览器本地，不会上传到服务器。包括客户信息、订单记录和设置配置。
                                </p>
                                <div className="text-xs text-muted-foreground">
                                    <p>• 客户数据: {JSON.parse(localStorage.getItem('billing_customers') || '[]').length} 条记录</p>
                                    <p>• 订单数据: {JSON.parse(localStorage.getItem('billing_orders') || '[]').length} 条记录</p>
                                    <p>• 存储大小: 约 {Math.round(JSON.stringify(localStorage).length / 1024)} KB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 危险区域 */}
                    <div className="bg-card border border-red-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h2 className="text-lg font-semibold text-red-500">危险区域</h2>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-red-700 mb-1">重置所有数据</h3>
                                    <p className="text-sm text-red-600">
                                        将清除所有客户信息、订单记录、常用商品和API配置。此操作不可撤销。
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowResetModal(true)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 ml-4"
                                >
                                    <Trash2 size={16} />
                                    重置数据
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 重置确认模态框 */}
            <Modal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                title="确认重置数据"
            >
                <div className="text-center py-4">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        您确定要重置所有数据吗？
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        此操作将永久删除所有客户信息、订单记录和设置配置，且无法恢复。
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowResetModal(false)}
                            className="flex-1 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            确认重置
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
