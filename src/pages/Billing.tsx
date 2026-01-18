import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, Printer, User, Search, Camera, FileText, Bell } from 'lucide-react';
import { analyzeImageWithDeepSeek } from '../services/openai';
import { useOrders, type OrderItem } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Modal from '../components/ui/Modal';
import Dropdown, { DropdownItem } from '../components/ui/Dropdown';
import { useToast } from '../components/ui/Toast';

function Billing() {
    const { addOrder } = useOrders();
    const { customers, addCustomer, updateCustomerSpending } = useCustomers();
    const [apiKey] = useLocalStorage('deepseek_api_key', '');
    const [recognitionPrompt] = useLocalStorage('deepseek_recognition_prompt', '');
    const { showToast } = useToast();

    // 常用列表
    const [savedGoods, setSavedGoods] = useLocalStorage<string[]>('billing_frequent_goods', ['四川西兰', '湖北红油菜']);
    
    // 商品列表
    const [products] = useLocalStorage<any[]>('billing_products', []);

    // 状态管理
    const [items, setItems] = useState<OrderItem[]>([]);
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
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [customerQuery, setCustomerQuery] = useState('');
    const [showAddCustomer, setShowAddCustomer] = useState(false);

    // 新客户表单
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        licensePlate: ''
    });

    // 过滤客户列表
    const filteredCustomers = useMemo(() => {
        const query = customerQuery.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(query) || 
            c.phone.includes(query) ||
            (c.email && c.email.toLowerCase().includes(query))
        );
    }, [customers, customerQuery]);

    // 选中的客户信息
    const selectedCustomerInfo = customers.find(c => c.id === selectedCustomer) as any;

    // 处理文件上传
    const handleFileUpload = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        if (!apiKey) {
            showToast({
                type: 'error',
                title: '缺少API密钥',
                message: '请先在设置页面配置OpenAI API密钥'
            });
            return;
        }

        try {
            const resultJson = await analyzeImageWithDeepSeek(file, apiKey, recognitionPrompt);
            const result = JSON.parse(resultJson);
            
            if (result.items && Array.isArray(result.items)) {
                const newItems = result.items.map((item: { name?: string; quantity?: number; price?: number }) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    name: item.name || 'Unknown Item',
                    quantity: Number(item.quantity) || 1,
                    price: Number(item.price) || ''
                }));
                setItems(prev => [...prev, ...newItems]);
                
                showToast({
                    type: 'success',
                    title: '识别成功',
                    message: `成功识别 ${newItems.length} 个商品`
                });
            } else {
                showToast({
                    type: 'warning',
                    title: '识别结果不完整',
                    message: '未能从图片中识别出商品信息，请检查图片质量'
                });
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            showToast({
                type: 'error',
                title: '识别失败',
                message: error instanceof Error ? error.message : '请检查API密钥或网络连接'
            });
        } finally {

        }
    };
    // 添加商品
    const addItem = (name = '') => {
        // 查找商品价格
        const product = products.find(p => p.name === name);
        const price = product ? product.price : '';
        
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            quantity: 1,
            price
        };
        setItems([...items, newItem]);
    };
    // 更新商品信息
    const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
        // 处理价格字段，保持空字符串值
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // 删除商品
    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    // 保存常用商品
    const saveFrequentGood = (name: string) => {
        if (name && !savedGoods.includes(name)) {
            setSavedGoods([...savedGoods, name]);
        }
    };

    // 添加客户
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
        setNewCustomer({ name: '', phone: '', licensePlate: '' });
        
        showToast({
            type: 'success',
            title: '客户添加成功'
        });
    };
    // 计算总金额
    const totalAmount = items.reduce((sum, item) => {
        const price = item.price || 0;
        return sum + (item.quantity * price);
    }, 0);
    // 确认下单
    const handleConfirm = () => {
        // 验证是否选择了客户
        if (!selectedCustomer) {
            showToast({
                type: 'error',
                title: '请选择客户'
            });
            return;
        }

        // 验证是否添加了商品
        if (items.length === 0) {
            showToast({
                type: 'error',
                title: '请添加商品'
            });
            return;
        }

        // 验证每个商品的信息
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.name || item.name.trim() === '') {
                showToast({
                    type: 'error',
                    title: '请填写商品名称',
                    message: `第 ${i + 1} 个商品未填写名称`
                });
                return;
            }
            if (!item.quantity || item.quantity <= 0) {
                showToast({
                    type: 'error',
                    title: '请填写商品数量',
                    message: `第 ${i + 1} 个商品数量无效`
                });
                return;
            }
            const price = item.price || 0;
            if (!price || price < 0) {
                showToast({
                    type: 'error',
                    title: '请填写商品单价',
                    message: `第 ${i + 1} 个商品单价无效`
                });
                return;
            }
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

    // 打印收据
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
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f5',
            fontFamily: 'PingFang SC, Helvetica Neue, Arial, sans-serif'
        }}>
            {/* 顶部蓝色导航栏 */}
            <div style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* 装饰元素 */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '-10%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%'
                }} />

                {/* 顶部操作栏 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <h1 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>老俞开单</h1>
                    <div style={{
                        display: 'flex',
                        gap: '1rem'
                    }}>
                        <button style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '2.5rem',
                            height: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Bell size={20} />
                        </button>
                        <button style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '2.5rem',
                            height: '2.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <FileText size={20} />
                        </button>
                    </div>
                </div>

                {/* 智能识别部分 */}
                <div style={{
                    marginTop: '0.5rem',
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.capture = 'camera';
                            input.onchange = handleFileUpload;
                            input.click();
                        }}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '1rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '2px dashed rgba(255, 255, 255, 0.3)',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                            (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                            (e.target as HTMLElement).style.backgroundColor = '';
                        }}
                    >
                        <Camera size={24} />
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '500'
                        }}>智能识别</span>
                    </button>
                </div>
            </div>

            {/* 主体内容 */}
            <div style={{
                padding: '1rem',
                paddingBottom: '8rem'
            }}>
                {/* 客户信息卡片 */}
                {selectedCustomerInfo && (
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1rem',
                        marginBottom: '1rem',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <User size={18} style={{ color: 'white' }} />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>{selectedCustomerInfo.name}</h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280'
                                }}>{selectedCustomerInfo.phone}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {/* 客户选择 */}
                    {!selectedCustomerInfo && (
                        <div style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '1rem',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h2 style={{
                                fontSize: '1rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <User size={18} />
                                选择客户
                            </h2>
                            
                            <Dropdown
                                trigger={
                                    <div style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        backgroundColor: '#ffffff',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <div>
                                                {selectedCustomerInfo ? (
                                                    <div>
                                                        <p style={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: '500',
                                                            color: '#374151'
                                                        }}>{selectedCustomerInfo.name}</p>
                                                        <p style={{
                                                            fontSize: '0.75rem',
                                                            color: '#6b7280'
                                                        }}>{selectedCustomerInfo.phone}</p>
                                                    </div>
                                                ) : (
                                                    <p style={{
                                                        fontSize: '0.875rem',
                                                        color: '#6b7280'
                                                    }}>选择或搜索客户</p>
                                                )}
                                            </div>
                                            <Search size={16} style={{ color: '#6b7280' }} />
                                        </div>
                                    </div>
                                }
                            >
                                <div style={{
                                    padding: '0.5rem'
                                }}>
                                    <input
                                        type="text"
                                        placeholder="搜索客户姓名或电话..."
                                        value={customerQuery}
                                        onChange={(e) => setCustomerQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        autoFocus
                                    />
                                </div>
                                
                                <div style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
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
                                                    <p style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        color: '#374151'
                                                    }}>{customer.name}</p>
                                                </div>
                                            </DropdownItem>
                                        ))
                                    ) : customerQuery ? (
                                        <div style={{
                                            padding: '1rem',
                                            textAlign: 'center'
                                        }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                marginBottom: '0.5rem'
                                            }}>未找到客户</p>
                                            <button
                                                onClick={() => {
                                                    setNewCustomer({ ...newCustomer, name: customerQuery });
                                                    setShowAddCustomer(true);
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#3b82f6',
                                                    fontSize: '0.875rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                添加新客户 "{customerQuery}"
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '1rem',
                                            textAlign: 'center'
                                        }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280'
                                            }}>暂无客户</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div style={{
                                    borderTop: '1px solid #e5e7eb',
                                    padding: '0.5rem'
                                }}>
                                    <button
                                        onClick={() => setShowAddCustomer(true)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#3b82f6',
                                            fontSize: '0.875rem',
                                            cursor: 'pointer',
                                            borderRadius: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.backgroundColor = '#eff6ff'}
                                        onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                                    >
                                        + 添加新客户
                                    </button>
                                </div>
                            </Dropdown>
                        </div>
                    )}

                    {/* 添加商品 */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1rem',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1rem'
                        }}>
                            <h2 style={{
                                fontSize: '1rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>添加商品</h2>
                            <span style={{
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                {items.length} 个商品
                            </span>
                        </div>

                        {/* 常用商品快捷按钮 */}
                        {savedGoods.length > 0 && (
                            <div style={{
                                marginBottom: '1rem'
                            }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginBottom: '0.5rem'
                                }}>常用商品:</p>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem'
                                }}>
                                    {savedGoods.map(good => (
                                        <button
                                            key={good}
                                            onClick={() => addItem(good)}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                background: '#f3f4f6',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                color: '#374151',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.backgroundColor = '#e5e7eb'}
                                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
                                        >
                                            {good}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => addItem()}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '1rem',
                                background: '#ffffff',
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                                (e.target as HTMLElement).style.borderColor = '#3b82f6';
                                (e.target as HTMLElement).style.color = '#3b82f6';
                            }}
                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                                (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                                (e.target as HTMLElement).style.color = '#6b7280';
                            }}
                        >
                            <Plus size={16} />
                            添加商品
                        </button>

                        {/* 商品列表 */}
                        <div style={{
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '0.75rem',
                                marginBottom: '1rem',
                                paddingBottom: '0.75rem',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                <div>
                                    <label style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        color: '#6b7280',
                                        marginBottom: '0.25rem',
                                        display: 'block'
                                    }}>
                                        名称
                                    </label>
                                </div>
                                <div>
                                    <label style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        color: '#6b7280',
                                        marginBottom: '0.25rem',
                                        display: 'block'
                                    }}>
                                        件数
                                    </label>
                                </div>
                                <div>
                                    <label style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        color: '#6b7280',
                                        marginBottom: '0.25rem',
                                        display: 'block'
                                    }}>
                                        单价
                                    </label>
                                </div>
                            </div>
                            
                            {items.map(item => (
                                <div key={item.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr',
                                    gap: '0.75rem',
                                    marginBottom: '1rem',
                                    padding: '1rem',
                                    background: '#f9fafb',
                                    borderRadius: '0.75rem'
                                }}>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="商品名称"
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            onBlur={() => saveFrequentGood(item.name)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="数量"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                            min="1"
                                        />
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}>
                                        <input
                                            type="number"
                                            placeholder="单价"
                                            value={item.price}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                updateItem(item.id, 'price', value === '' ? '' : Number(value));
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                            min="0"
                                            step="0.01"
                                        />
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            style={{
                                                padding: '0.5rem',
                                                background: '#fee2e2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '0.5rem',
                                                color: '#dc2626',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                (e.target as HTMLElement).style.backgroundColor = '#fecaca';
                                            }}
                                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                (e.target as HTMLElement).style.backgroundColor = '#fee2e2';
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 总计和操作按钮 */}
                        <div style={{
                            borderTop: '1px solid #e5e7eb',
                            paddingTop: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <span style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>总计:</span>
                                <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: '#3b82f6'
                                }}>
                                    ¥{totalAmount.toFixed(2)}
                                </span>
                            </div>
                            
                            <button
                                onClick={handleConfirm}
                                disabled={items.length === 0 || !selectedCustomer}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    background: items.length > 0 && selectedCustomer ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#9ca3af',
                                    border: 'none',
                                    borderRadius: '1rem',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: items.length > 0 && selectedCustomer ? 'pointer' : 'not-allowed',
                                    boxShadow: items.length > 0 && selectedCustomer ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                确认下单
                            </button>
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
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            客户姓名 *
                        </label>
                        <input
                            type="text"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            placeholder="请输入客户姓名"
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            联系电话 (选填)
                        </label>
                        <input
                            type="tel"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            placeholder="请输入联系电话"
                        />
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            车牌号 (选填)
                        </label>
                        <input
                            type="text"
                            value={newCustomer.licensePlate}
                            onChange={(e) => setNewCustomer({ ...newCustomer, licensePlate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                outline: 'none',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            placeholder="请输入车牌号"
                        />
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: '1rem'
                    }}>
                        <button
                            onClick={() => setShowAddCustomer(false)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                background: '#ffffff',
                                color: '#374151',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#ffffff'}
                        >
                            取消
                        </button>
                        <button
                            onClick={handleAddCustomer}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.opacity = '1'}
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
                <div style={{
                    textAlign: 'center',
                    padding: '2rem 1rem'
                }}>
                    <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }}>
                        订单已成功创建！
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '2rem'
                    }}>
                        订单金额: ¥{lastOrder?.totalAmount.toFixed(2)}
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem'
                    }}>
                        <button
                            onClick={() => setShowSuccess(false)}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                background: '#ffffff',
                                color: '#374151',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f9fafb'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#ffffff'}
                        >
                            继续开单
                        </button>
                        <button
                            onClick={handlePrint}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.opacity = '1'}
                        >
                            <Printer size={16} />
                            打印收据
                        </button>
                    </div>
                </div>
            </Modal>

            {/* 底部导航栏 */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                borderTop: '1px solid #e5e7eb',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
                zIndex: 50
            }}>
                {/* 首页 */}
                <Link to="/" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: '#6b7280',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FileText size={20} />
                    </div>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '400'
                    }}>首页</span>
                </Link>

                {/* 经营 */}
                <Link to="/analysis" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: '#6b7280',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FileText size={20} />
                    </div>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '400'
                    }}>经营</span>
                </Link>

                {/* 我的 */}
                <Link to="/settings" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: '#6b7280',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <User size={20} />
                    </div>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '400'
                    }}>我的</span>
                </Link>
            </div>
        </div>
    );
}

export default Billing;