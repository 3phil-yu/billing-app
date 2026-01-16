import { useState, useEffect } from 'react';
import { Save, Trash2, Key, AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Settings() {
    const [apiKey, setApiKey] = useLocalStorage('gemini_api_key', '');
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        setInputValue(apiKey);
    }, [apiKey]);

    const handleSave = () => {
        setApiKey(inputValue);
        alert('设置已保存！');
    };

    const handleReset = () => {
        if (confirm("您确定要重置所有数据吗？此操作无法撤销。")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    系统设置
                </h1>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-lg space-y-6">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <Key size={20} className="text-primary" />
                        API 配置
                    </h2>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Google Gemini API 密钥</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="AIzaSy..."
                                className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors"
                            />
                            <button onClick={handleSave} className="btn btn-primary gap-2">
                                <Save size={18} /> 保存
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            OCR 图片识别和智能需求分析功能需要此密钥。
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-4 text-red-500">
                        <AlertTriangle size={20} />
                        危险区域
                    </h2>
                    <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
                        <div>
                            <h3 className="font-medium text-red-500">重置应用</h3>
                            <p className="text-sm text-muted-foreground">清除所有客户、订单和设置数据。</p>
                        </div>
                        <button onClick={handleReset} className="btn bg-red-500 text-white hover:bg-red-600 gap-2">
                            <Trash2 size={18} /> 全部重置
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
