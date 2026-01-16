import { useState, useMemo } from 'react';
import { Upload, Plus, Trash2, CheckCircle, Loader2, Printer, User, Search, Save, History } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { useOrders, type OrderItem } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useLocalStorage } from '../hooks/useLocalStorage';

function Billing() {
    const { addOrder } = useOrders();
    const { customers } = useCustomers();
    const [apiKey] = useLocalStorage('gemini_api_key', '');

    // Frequent lists for quick selection
    const [savedGoods, setSavedGoods] = useLocalStorage<string[]>('billing_frequent_goods', ['四川西兰', '湖北红油菜']);
    const [savedCustomers, setSavedCustomers] = useLocalStorage<string[]>('billing_frequent_customers', []);

    const [items, setItems] = useState<OrderItem[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);

    // Customer selection state
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [customerQuery, setCustomerQuery] = useState('');

    const filteredCustomers = useMemo(() => {
        const query = customerQuery.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(query) || c.phone.includes(query)
        );
    }, [customers, customerQuery]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsAnalyzing(true);
        try {
            const resultJson = await analyzeImage(file, apiKey);
            const result = JSON.parse(resultJson);
            if (result.items && Array.isArray(result.items)) {
                const newItems = result.items.map((item: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    name: item.name || 'Unknown Item',
                    quantity: Number(item.quantity) || 1,
                    price: Number(item.price) || 0
                }));
                setItems(prev => [...prev, ...newItems]);
            }
        } catch (error) {
            console.error(error);
            alert("Gemini 识别失败，请检查 API Key 或网络连通性。");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const addItem = (name = '') => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), name: name, quantity: 1, price: 0 }]);
    };

    const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const saveFrequentGood = (name: string) => {
        if (name && !savedGoods.includes(name)) {
            setSavedGoods([...savedGoods, name]);
        }
    };

    const saveFrequentCustomer = (name: string) => {
        if (name && !savedCustomers.includes(name)) {
            setSavedCustomers([...savedCustomers, name]);
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleConfirm = () => {
        if (items.length === 0) return;
        const order = addOrder(items, selectedCustomer);
        setLastOrder(order);
        setItems([]);
        setSelectedCustomer('');
    };

    const handlePrint = () => {
        if (!lastOrder) return;
        const customerName = customers.find(c => c.id === lastOrder.customerId)?.name || lastOrder.customerId || '匿名客户';
        const receipt = `
      账单详情
      客户: ${customerName}
      日期: ${new Date(lastOrder.date).toLocaleString()}
      流水号: ${lastOrder.id}
      ---------------------------
      ${lastOrder.items.map((i: any) => `${i.name} x${i.quantity} @ ${i.price}`).join('\n')}
      ---------------------------
      总计: ¥${lastOrder.totalAmount}
      
      感谢您的光临！
    `;
        const win = window.open('', '', 'width=380,height=500');
        win?.document.write(`
            <html>
                <body style="font-family: monospace; padding: 20px;">
                    <pre style="white-space: pre-wrap;">${receipt}</pre>
                </body>
            </html>
        `);
        win?.document.close();
        win?.print();
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">智能开单</h1>
                    <p className="text-muted-foreground mt-1">支持图片 OCR 自动识别及便捷录入</p>
                </div>
            </div>

            {/* Customer & Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Select */}
                <div className="md:col-span-1 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <label className="text-sm font-bold flex items-center gap-2 mb-4">
                            <User size={18} className="text-primary" /> 选择客户
                        </label>
                        <div className="relative">
                            <div
                                onClick={() => setShowCustomerSearch(true)}
                                className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-4 py-3 cursor-pointer hover:border-primary/50 transition-all"
                            >
                                <Search size={16} className="text-muted-foreground" />
                                <span className={selectedCustomer ? 'text-foreground' : 'text-muted-foreground'}>
                                    {customers.find(c => c.id === selectedCustomer)?.name || selectedCustomer || '选择或输入客户名'}
                                </span>
                            </div>

                            {showCustomerSearch && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowCustomerSearch(false)}></div>
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-in zoom-in-95">
                                        <div className="p-2 sticky top-0 bg-popover border-b border-border">
                                            <input
                                                autoFocus
                                                type="text"
                                                className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                                placeholder="搜索客户..."
                                                value={customerQuery}
                                                onChange={e => setCustomerQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="p-1">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.map(c => (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => { setSelectedCustomer(c.id); setShowCustomerSearch(false); }}
                                                        className="px-4 py-3 hover:bg-muted rounded-lg cursor-pointer text-sm flex justify-between group"
                                                    >
                                                        <span>{c.name}</span>
                                                        <span className="text-xs text-muted-foreground">{c.phone}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div
                                                    onClick={() => { setSelectedCustomer(customerQuery); setShowCustomerSearch(false); saveFrequentCustomer(customerQuery); }}
                                                    className="px-4 py-3 text-sm text-primary hover:bg-primary/5 cursor-pointer font-medium"
                                                >
                                                    + 将 "{customerQuery}" 作为新客户
                                                </div>
                                            )}
                                        </div>
                                        {savedCustomers.length > 0 && (
                                            <div className="border-t border-border p-2">
                                                <p className="text-[10px] text-muted-foreground mb-1 px-2 uppercase font-bold">常用选择</p>
                                                {savedCustomers.map(sc => (
                                                    <div
                                                        key={sc}
                                                        onClick={() => { setSelectedCustomer(sc); setShowCustomerSearch(false); }}
                                                        className="px-4 py-2 hover:bg-muted rounded-lg cursor-pointer text-sm"
                                                    >
                                                        {sc}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 italic">
                        * 可以在“客户管理”中录入详细资料
                    </p>
                </div>

                {/* Upload Image */}
                <div className="md:col-span-2 bg-card border-2 border-dashed border-border rounded-2xl p-6 transition-colors hover:border-primary/50 relative overflow-hidden group flex flex-col items-center justify-center text-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileUpload}
                        disabled={isAnalyzing}
                    />
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {isAnalyzing ? <Loader2 className="animate-spin" size={28} /> : <Upload size={28} />}
                    </div>
                    <div>
                        <h3 className="font-bold">上传订单图片</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {isAnalyzing ? "正在识别内容..." : "拖拽或点击此处扫描"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Order Items Table */}
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        单据明细 <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{items.length} 项</span>
                    </h2>
                    <div className="flex gap-2">
                        {savedGoods.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1">
                                {savedGoods.slice(0, 3).map(good => (
                                    <button
                                        key={good}
                                        onClick={() => addItem(good)}
                                        className="text-[10px] bg-muted hover:bg-primary/10 hover:text-primary px-2 py-1 rounded-md border border-border transition-colors transition-colors"
                                    >
                                        + {good}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button onClick={() => addItem()} className="btn btn-primary btn-sm gap-1">
                            <Plus size={14} /> 添加
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="text-xs text-muted-foreground text-left uppercase tracking-wider border-b border-border">
                                <th className="pb-4 font-bold pl-2">#</th>
                                <th className="pb-4 font-bold">货品/项目名</th>
                                <th className="pb-4 font-bold text-center">数量</th>
                                <th className="pb-4 font-bold text-right">单价 (¥)</th>
                                <th className="pb-4 font-bold text-right pr-2">合计 (¥)</th>
                                <th className="pb-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                        <History size={32} className="mx-auto mb-2 opacity-20" />
                                        点击上方“添加”或上传图片开始录入
                                    </td>
                                </tr>
                            )}
                            {items.map((item, index) => (
                                <tr key={item.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="py-4 pl-2 text-sm text-muted-foreground font-medium">{index + 1}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2 mr-4">
                                            <input
                                                type="text"
                                                className="w-full bg-transparent outline-none text-foreground font-medium focus:text-primary transition-colors"
                                                value={item.name}
                                                placeholder="项目名称..."
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            />
                                            <button
                                                onClick={() => saveFrequentGood(item.name)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-all rounded"
                                                title="保存到常用列表"
                                            >
                                                <Save size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 w-24">
                                        <input
                                            type="number"
                                            className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-center text-sm outline-none focus:border-primary"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="py-4 w-32">
                                        <input
                                            type="number"
                                            className="w-full bg-muted/30 border border-border rounded-lg px-2 py-1.5 text-right text-sm outline-none focus:border-primary"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="py-4 text-right font-bold pr-2 text-foreground">
                                        {(item.quantity * item.price).toLocaleString()}
                                    </td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-muted/30 p-8 border-t border-border mt-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-10">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Items</p>
                                <p className="text-2xl font-bold">{items.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Amount</p>
                                <p className="text-3xl font-bold text-primary">¥ {totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none btn btn-ghost border border-border px-8">保存草稿</button>
                            <button
                                onClick={handleConfirm}
                                disabled={items.length === 0}
                                className="flex-1 md:flex-none btn btn-primary px-10 gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                <CheckCircle size={20} />
                                确认下单并生成流水
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Order Dialog */}
            {lastOrder && (
                <div className="bg-green-500/10 border border-green-500/50 p-6 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-6 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-500">单据已成功入帐</h3>
                            <p className="text-xs text-muted-foreground">流水 ID: {lastOrder.id} • 合计: ¥{lastOrder.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <button onClick={handlePrint} className="btn bg-green-500 hover:bg-green-600 text-white gap-2 h-12 px-6 shadow-lg shadow-green-500/20">
                        <Printer size={18} /> 打印小票 / 凭证
                    </button>
                </div>
            )}
        </div>
    );
}

export default Billing;
