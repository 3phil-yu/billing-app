import { useState, useMemo } from 'react';
import { Upload, Plus, Trash2, CheckCircle, Printer, User, Search } from 'lucide-react';
import { analyzeImage } from '../services/gemini';
import { useOrders, type OrderItem } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/ui/Modal';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';

function Billing() {
    const { addOrder } = useOrders();
    const { customers, addCustomer, updateCustomerSpending } = useCustomers();
    const [apiKey] = useLocalStorage('gemini_api_key', '');
    const { showToast } = useToast();

    // 常用列表
    const [savedGoods, setSavedGoods] = useLocalStorage<string[]>('billing_frequent_goods', ['四川西兰', '湖北红油菜']);

    // 状态管理
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastOrder, setLastOrder] = useState<{
        id: string;
        date: string;
        items: OrderItem[];
        totalAmount: number;
        customerId?: string;
        status: string;
    } | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // 客户选择状态
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [customerQuery, setCustomerQuery] = useState('');
    const [showAddCustomer, setShowAddCustomer] = useState(false);

    // 新客户表单
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: ''
    });

    // 过滤客户列表
    const filteredCustomers = useMemo(() => {
        const query = customerQuery.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(query) || 
            c.phone.includes(query) ||
            c.email.toLowerCase().includes(query)
        );
    }, [customers, customerQuery]);

    // 选中的客户信息
    const selectedCustomerInfo = customers.find(c => c.id === selectedCustomer);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!apiKey) {
            showToast({
                type: 'error',
                title: '缺少API密钥',
                message: '请先在设置页面配置Gemini API密钥'
            });
            return;
        }

        setIsAnalyzing(true);
        try {
            const resultJson = await analyzeImage(file, apiKey);
            const result = JSON.parse(resultJson);
            
            if (result.items && Array.isArray(result.items)) {
                const newItems = result.items.map((item: { name?: string; quantity?: number; price?: number }) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    name: item.name || 'Unknown Item',
                    quantity: Number(item.quantity) || 1,
                    price: Number(item.price) || 0
                }));
                setItems(prev => [...prev, ...newItems]);
                
                showToast({
                    type: 'success',
                    title: '识别成功',
                    message: `成功识别 ${newItems.length} 个商品`
                });
            }
        } catch (error) {
            console.error(error);
            showToast({
                type: 'error',
                title: '识别失败',
                message: '请检查API密钥或网络连接'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const addItem = (name = '') => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            quantity: 1,
            price: 0
        };
        setItems([...items, newItem]);
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

    const handleAddCustomer = () => {
        if (!newCustomer.name.trim()) {
            showToast({
                type: 'error',
                title: '请填写客户姓名'
            });
            return;
        }

        addCustomer(newCustomer);
        setShowAddCustomer(false);
        setNewCustomer({ name: '', phone: '', email: '' });
        
        showToast({
            type: 'success',
            title: '客户添加成功'
        });
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleConfirm = () => {
        if (items.length === 0) {
            showToast({
                type: 'error',
                title: '请添加商品'
            });
            return;
        }

        const order = addOrder(items, selectedCustomer);
        
        // 更新客户支出
        if (selectedCustomer) {
            updateCustomerSpending(selectedCustomer, totalAmount);
        }

        setLastOrder(order);
        setShowSuccess(true);
        setItems([]);
        setSelectedCustomer('');
        setCustomerQuery('');

        showToast({
            type: 'success',
            title: '订单创建成功',
            message: `订单金额: ¥${totalAmount.toLocaleString()}`
        });
    };

    const handlePrint = () => {
        if (!lastOrder) return;

        const printContent = `
            <div style="font-family: monospace; width: 300px; margin: 0 auto;">
                <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
                    <h2>收据</h2>
                    <p>订单号: ${lastOrder.id}</p>
                    <p>时间: ${new Date(lastOrder.date).toLocaleString('zh-CN')}</p>
                </div>
                
                ${selectedCustomerInfo ? `
                    <div style="margin-bottom: 10px;">
                        <p>客户: ${selectedCustomerInfo.name}</p>
                        <p>电话: ${selectedCustomerInfo.phone}</p>
                    </div>
                ` : ''}
                
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px dashed #000;">
                            <th style="text-align: left; padding: 5px;">商品</th>
                            <th style="text-align: right; padding: 5px;">数量</th>
                            <th style="text-align: right; padding: 5px;">单价</th>
                            <th style="text-align: right; padding: 5px;">小计</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${lastOrder.items.map((item: OrderItem) => `
                            <tr>
                                <td style="padding: 3px;">${item.name}</td>
                                <td style="text-align: right; padding: 3px;">${item.quantity}</td>
                                <td style="text-align: right; padding: 3px;">¥${item.price}</td>
                                <td style="text-align: right; padding: 3px;">¥${(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; text-align: right;">
                    <p><strong>总计: ¥${lastOrder.totalAmount.toFixed(2)}</strong></p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                    <p>谢谢惠顾！</p>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>打印收据</title>
                        <style>
                            @media print {
                                body { margin: 0; }
                                @page { margin: 10mm; }
                            }
                        </style>
                    </head>
                    <body>${printContent}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-card-foreground mb-2">智能开单</h1>
                    <p className="text-muted-foreground">上传图片自动识别商品，或手动添加订单项目</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 客户选择 */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-lg border border-border p-6">
                            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                                <User size={20} />
                                选择客户
                            </h2>
                            
                            <Dropdown
                                trigger={
                                    <div className="w-full p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {selectedCustomerInfo ? (
                                                    <div>
                                                        <p className="font-medium text-card-foreground">{selectedCustomerInfo.name}</p>
                                                        <p className="text-sm text-muted-foreground">{selectedCustomerInfo.phone}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">选择或搜索客户</p>
                                                )}
                                            </div>
                                            <Search size={16} className="text-muted-foreground" />
                                        </div>
                                    </div>
                                }
                            >
                                <div className="p-2">
                                    <input
                                        type="text"
                                        placeholder="搜索客户姓名或电话..."
                                        value={customerQuery}
                                        onChange={(e) => setCustomerQuery(e.target.value)}
                                        className="w-full p-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="max-h-48 overflow-y-auto">
                                    {filteredCustomers.length > 0 ? (
                                        filteredCustomers.map(customer => (
                                            <DropdownItem
                                                key={customer.id}
                                                onClick={() => {
                                                    setSelectedCustomer(customer.id);
                                                    setCustomerQuery('');
                                                }}
                                            >
                                                <div>
                                                    <p className="font-medium">{customer.name}</p>
                                                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                                </div>
                                            </DropdownItem>
                                        ))
                                    ) : customerQuery ? (
                                        <div className="p-4 text-center">
                                            <p className="text-sm text-muted-foreground mb-2">未找到客户</p>
                                            <button
                                                onClick={() => {
                                                    setNewCustomer({ ...newCustomer, name: customerQuery });
                                                    setShowAddCustomer(true);
                                                }}
                                                className="text-sm text-primary hover:underline"
                                            >
                                                添加新客户 "{customerQuery}"
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center">
                                            <p className="text-sm text-muted-foreground">暂无客户</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="border-t border-border p-2">
                                    <button
                                        onClick={() => setShowAddCustomer(true)}
                                        className="w-full p-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
                                    >
                                        + 添加新客户
                                    </button>
                                </div>
                            </Dropdown>
                        </div>
                    </div>

                    {/* 图片上传 */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-lg border border-border p-6">
                            <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                                <Upload size={20} />
                                智能识别
                            </h2>
                            
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isAnalyzing}
                                />
                                <div className={`
                                    border-2 border-dashed border-border rounded-lg p-8 text-center
                                    ${isAnalyzing ? 'bg-muted' : 'hover:bg-muted/50 transition-colors'}
                                `}>
                                    {isAnalyzing ? (
                                        <LoadingSpinner text="AI识别中..." />
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-card-foreground font-medium mb-2">上传订单图片</p>
                                            <p className="text-sm text-muted-foreground">
                                                支持 JPG、PNG 格式<br />
                                                AI将自动识别商品和价格
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 订单明细 */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-lg border border-border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-card-foreground">订单明细</h2>
                                <span className="text-sm text-muted-foreground">
                                    {items.length} 个商品
                                </span>
                            </div>

                            {/* 常用商品快捷按钮 */}
                            {savedGoods.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-muted-foreground mb-2">常用商品:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {savedGoods.map(good => (
                                            <button
                                                key={good}
                                                onClick={() => addItem(good)}
                                                className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
                                            >
                                                {good}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => addItem()}
                                className="w-full mb-4 p-3 border border-dashed border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 text-muted-foreground"
                            >
                                <Plus size={16} />
                                添加商品
                            </button>

                            {/* 商品列表 */}
                            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                                        <div className="grid grid-cols-12 gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="商品名称"
                                                value={item.name}
                                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                onBlur={() => saveFrequentGood(item.name)}
                                                className="col-span-5 p-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                            <input
                                                type="number"
                                                placeholder="数量"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                className="col-span-2 p-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                min="1"
                                            />
                                            <input
                                                type="number"
                                                placeholder="单价"
                                                value={item.price}
                                                onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                                className="col-span-3 p-2 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                                min="0"
                                                step="0.01"
                                            />
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="col-span-2 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                title="删除商品"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="mt-2 text-right">
                                            <span className="text-sm text-muted-foreground">
                                                小计: ¥{(item.quantity * item.price).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 总计和操作按钮 */}
                            <div className="border-t border-border pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold text-card-foreground">总计:</span>
                                    <span className="text-xl font-bold text-primary">
                                        ¥{totalAmount.toFixed(2)}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={handleConfirm}
                                    disabled={items.length === 0}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    确认下单
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 添加客户模态框 */}
            <Modal
                isOpen={showAddCustomer}
                onClose={() => setShowAddCustomer(false)}
                title="添加新客户"
            >
                <div className="space-y-4">
                    <div>
                        <label htmlFor="customer-name" className="block text-sm font-medium text-card-foreground mb-1">
                            客户姓名 *
                        </label>
                        <input
                            id="customer-name"
                            type="text"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="请输入客户姓名"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="customer-phone" className="block text-sm font-medium text-card-foreground mb-1">
                            联系电话
                        </label>
                        <input
                            id="customer-phone"
                            type="tel"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="请输入联系电话"
                        />
                    </div>
                    <div>
                        <label htmlFor="customer-email" className="block text-sm font-medium text-card-foreground mb-1">
                            邮箱地址
                        </label>
                        <input
                            id="customer-email"
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="请输入邮箱地址"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setShowAddCustomer(false)}
                            className="flex-1 py-2 px-4 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            取消
                        </button>
                        <button
                            onClick={handleAddCustomer}
                            className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            添加客户
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 成功提示模态框 */}
            <Modal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="订单创建成功"
            >
                <div className="text-center py-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-card-foreground mb-2">
                        订单已成功创建！
                    </p>
                    <p className="text-muted-foreground mb-6">
                        订单金额: ¥{lastOrder?.totalAmount.toFixed(2)}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="flex-1 py-2 px-4 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            继续开单
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Printer size={16} />
                            打印收据
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Billing;