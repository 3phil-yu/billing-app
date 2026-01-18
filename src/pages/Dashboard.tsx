import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, FileText, Store, TrendingUp, Users } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import html2canvas from 'html2canvas';

function Dashboard() {
    const [dateRange] = useState('今天00:00 至 今天23:59');
    const [showRepaymentModal, setShowRepaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [orders, setOrders] = useLocalStorage<any[]>('billing_orders', []);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
    const [customers] = useLocalStorage<any[]>('billing_customers', []);
    const [showProductModal, setShowProductModal] = useState(false);
    const [products, setProducts] = useLocalStorage<any[]>('billing_products', []);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    


    // 生成订单图片并分享
    const shareOrder = async (order: any) => {
        setIsGeneratingImage(true);
        try {
            // 创建一个临时的订单元素用于生成图片
            const orderElement = document.createElement('div');
            orderElement.style.background = 'white';
            orderElement.style.padding = '2rem';
            orderElement.style.borderRadius = '1rem';
            orderElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            orderElement.style.width = '300px';
            orderElement.style.margin = '0 auto';
            orderElement.style.fontFamily = 'PingFang SC, Helvetica Neue, Arial, sans-serif';
            
            // 获取客户信息
            const customer = customers.find((c: any) => c.id === order.customerId);
            
            // 构建订单内容
            orderElement.innerHTML = `
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 1.25rem; font-weight: bold; color: #374151; margin-bottom: 0.5rem;">订单详情</h2>
                    <p style="font-size: 0.875rem; color: #6b7280;">订单号: ${order.id}</p>
                    <p style="font-size: 0.875rem; color: #6b7280;">日期: ${order.date}</p>
                    ${customer ? `<p style="font-size: 0.875rem; color: #6b7280;">客户: ${customer.name}</p>` : ''}
                    <p style="font-size: 0.875rem; color: ${order.status === '赊欠' ? '#f97316' : '#10b981'}; font-weight: 500;">状态: ${order.status}</p>
                </div>
                <div style="border-top: 1px dashed #e5e7eb; padding-top: 1rem; margin-bottom: 1rem;">
                    <h3 style="font-size: 1rem; font-weight: 500; color: #374151; margin-bottom: 1rem;">商品明细</h3>
                    ${order.items.map((item: any) => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                            <div>
                                <p style="font-size: 0.875rem; font-weight: 500; color: #374151;">${item.name}</p>
                                <p style="font-size: 0.75rem; color: #6b7280;">${item.quantity} × ¥${item.price}</p>
                            </div>
                            <p style="font-size: 0.875rem; font-weight: 500; color: #374151;">¥${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                    `).join('')}
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p style="font-size: 1rem; font-weight: 500; color: #374151;">总计:</p>
                        <p style="font-size: 1.25rem; font-weight: bold; color: #3b82f6;">¥${order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #e5e7eb;">
                    <p style="font-size: 0.75rem; color: #6b7280;">老俞开单系统</p>
                    <p style="font-size: 0.75rem; color: #6b7280;">${new Date().toLocaleString('zh-CN')}</p>
                </div>
            `;
            
            // 将元素添加到文档中
            document.body.appendChild(orderElement);
            
            // 使用html2canvas生成图片
            const canvas = await html2canvas(orderElement, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            // 从canvas创建图片URL
            const imageUrl = canvas.toDataURL('image/png');
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = imageUrl;
            downloadLink.download = `订单_${order.id}.png`;
            downloadLink.click();
            
            // 检查是否支持Web Share API
            if (typeof navigator.share === 'function') {
                try {
                    // 由于Web Share API不支持直接分享图片URL，我们需要先下载图片
                    // 这里我们使用一个简单的提示，让用户手动分享下载的图片
                    alert('订单图片已下载，请在相册中找到并分享到微信等渠道');
                } catch (error) {
                    console.error('分享失败:', error);
                    alert('订单图片已下载，请在相册中找到并分享到微信等渠道');
                }
            } else {
                // 如果不支持Web Share API，提示用户手动分享
                alert('订单图片已下载，请在相册中找到并分享到微信等渠道');
            }
            
            // 清理临时元素
            document.body.removeChild(orderElement);
        } catch (error) {
            console.error('生成图片失败:', error);
            alert('生成订单图片失败，请重试');
        } finally {
            setIsGeneratingImage(false);
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
                    }}>智能开单</h1>
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
            </div>

            {/* 功能图标区域 */}
            <div style={{
                background: 'white',
                borderRadius: '1rem 1rem 0 0',
                marginTop: '-1.5rem',
                padding: '1.5rem 1rem',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem'
                }}>
                    {/* 订单管理 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }} onClick={() => window.location.href = '/analysis'}>
                        <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                        }}>
                            <FileText size={24} style={{ color: 'white' }} />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#374151',
                            textAlign: 'center'
                        }}>订单管理</span>
                    </div>

                    {/* 客户管理 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }} onClick={() => setShowShareModal(true)}>
                        <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            <Users size={24} style={{ color: 'white' }} />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#374151',
                            textAlign: 'center'
                        }}>客户管理</span>
                    </div>

                    {/* 商品管理 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }} onClick={() => setShowProductModal(true)}>
                        <div style={{
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                        }}>
                            <Store size={24} style={{ color: 'white' }} />
                        </div>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#374151',
                            textAlign: 'center'
                        }}>商品管理</span>
                    </div>
                </div>
            </div>



            {/* 开单统计区域 */}
            <div style={{
                marginTop: '1rem',
                background: 'white',
                padding: '1rem',
                borderRadius: '1rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: '#374151'
                        }}>开单统计</h3>
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#6b7280'
                        }}>
                            →
                        </button>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>{dateRange}</p>
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#6b7280'
                        }}>
                            📅
                        </button>
                    </div>
                </div>

                {/* 统计数据 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem'
                }}>
                    {/* 开单 */}
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '0.5rem'
                        }}>开单(0单)</p>
                        <h4 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#374151'
                        }}>¥0</h4>
                    </div>

                    {/* 赊欠 */}
                    <div style={{
                        background: '#fef3c7',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#92400e',
                            marginBottom: '0.5rem'
                        }}>赊欠(0人)</p>
                        <h4 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#92400e'
                        }}>¥0</h4>
                    </div>

                    {/* 已收金额 */}
                    <div style={{
                        background: '#dcfce7',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#166534',
                            marginBottom: '0.5rem'
                        }}>已收金额</p>
                        <h4 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#166534'
                        }}>¥0</h4>
                    </div>

                    {/* 还款记录 */}
                    <div style={{
                        background: '#dbeafe',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#1e40af',
                            marginBottom: '0.5rem'
                        }}>还款记录</p>
                        <h4 style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#1e40af'
                        }}>¥0</h4>
                    </div>
                </div>

                {/* 查看趋势 */}
                <div style={{
                    marginTop: '1rem',
                    textAlign: 'center'
                }}>
                    <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f97316',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        margin: '0 auto'
                    }}>
                        <TrendingUp size={16} />
                        查看趋势
                        →
                    </button>
                </div>
            </div>

            {/* 底部开单按钮 */}
            <div style={{
                position: 'fixed',
                bottom: '7rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100
            }}>
                <Link to="/billing" style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '5rem',
                    height: '5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}>
                        <div style={{
                            width: '1.5rem',
                            height: '1.5rem',
                            borderRadius: '0.5rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FileText size={18} style={{ color: 'white' }} />
                        </div>
                        <span style={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>开单</span>
                    </div>
                </Link>
            </div>

            {/* 还款登记模态框 */}
            {showRepaymentModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        width: '90%',
                        maxWidth: '400px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '1rem'
                        }}>还款登记</h3>
                        
                        <div style={{
                            marginBottom: '1.5rem'
                        }}>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.75rem'
                            }}>选择订单</h4>
                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {orders.map((order: any) => (
                                    <div 
                                        key={order.id}
                                        style={{
                                            padding: '0.75rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer',
                                            backgroundColor: selectedOrder?.id === order.id ? '#eff6ff' : 'white'
                                        }}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <p style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }}>{order.date}</p>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280'
                                                }}>金额: ¥{order.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                                color: order.status === '赊欠' ? '#f97316' : '#10b981'
                                            }}>{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {selectedOrder && (
                            <div style={{
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.75rem'
                                }}>订单详情</h4>
                                <div style={{
                                    background: '#f9fafb',
                                    borderRadius: '0.5rem',
                                    padding: '1rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: '#374151'
                                        }}>日期: {selectedOrder.date}</p>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: selectedOrder.status === '赊欠' ? '#f97316' : '#10b981'
                                        }}>{selectedOrder.status}</p>
                                    </div>
                                    <div style={{
                                        marginBottom: '0.75rem'
                                    }}>
                                        {selectedOrder.items.map((item: any, index: number) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280'
                                                }}>{item.name}</p>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280'
                                                }}>{item.quantity} × ¥{item.price} = ¥{(item.quantity * item.price).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontWeight: '500'
                                    }}>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: '#374151'
                                        }}>总计:</p>
                                        <p style={{
                                            fontSize: '0.875rem',
                                            color: '#374151'
                                        }}>¥{selectedOrder.totalAmount.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    background: '#ffffff',
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setShowRepaymentModal(false)}
                            >
                                取消
                            </button>
                            {selectedOrder && (
                                <button
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        background: selectedOrder.status === '赊欠' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        // 更新订单状态
                                        const updatedOrders = orders.map((order: any) => 
                                            order.id === selectedOrder.id 
                                                ? { ...order, status: order.status === '赊欠' ? '已付' : '赊欠' }
                                                : order
                                        );
                                        setOrders(updatedOrders);
                                        setShowRepaymentModal(false);
                                        setSelectedOrder(null);
                                    }}
                                >
                                    {selectedOrder.status === '赊欠' ? '标记为已付' : '标记为赊欠'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 分享货主模态框 */}
            {showShareModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        width: '90%',
                        maxWidth: '400px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '1rem'
                        }}>分享货主</h3>
                        
                        <div style={{
                            marginBottom: '1.5rem'
                        }}>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.75rem'
                            }}>选择客户</h4>
                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {customers.map((customer: any) => (
                                    <div 
                                        key={customer.id}
                                        style={{
                                            padding: '0.75rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer',
                                            backgroundColor: selectedCustomer?.id === customer.id ? '#eff6ff' : 'white'
                                        }}
                                        onClick={() => {
                                            setSelectedCustomer(customer);
                                            setSelectedOrders([]);
                                        }}
                                    >
                                        <p style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151'
                                        }}>{customer.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {selectedCustomer && (
                            <div style={{
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.75rem'
                                }}>客户订单</h4>
                                <div style={{
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    {orders
                                        .filter((order: any) => order.customerId === selectedCustomer.id)
                                        .map((order: any) => (
                                            <div 
                                                key={order.id}
                                                style={{
                                                    padding: '0.75rem',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '0.5rem',
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <div>
                                                        <p style={{
                                                            fontSize: '0.875rem',
                                                            fontWeight: '500',
                                                            color: '#374151'
                                                        }}>{order.date}</p>
                                                        <p style={{
                                                            fontSize: '0.75rem',
                                                            color: '#6b7280'
                                                        }}>金额: ¥{order.totalAmount.toFixed(2)}</p>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedOrders.some(o => o.id === order.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedOrders([...selectedOrders, order]);
                                                                } else {
                                                                    setSelectedOrders(selectedOrders.filter(o => o.id !== order.id));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '0.5rem'
                                                }}>
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            border: '1px solid #3b82f6',
                                                            borderRadius: '0.5rem',
                                                            background: '#eff6ff',
                                                            color: '#3b82f6',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => shareOrder(order)}
                                                        disabled={isGeneratingImage}
                                                    >
                                                        {isGeneratingImage ? '生成中...' : '分享订单'}
                                                    </button>
                                                    <button
                                                        style={{
                                                            flex: 1,
                                                            padding: '0.5rem',
                                                            border: '1px solid #10b981',
                                                            borderRadius: '0.5rem',
                                                            background: '#dcfce7',
                                                            color: '#059669',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => {
                                                            // 更新订单状态
                                                            const updatedOrders = orders.map((o: any) => 
                                                                o.id === order.id 
                                                                    ? { ...o, status: o.status === '赊欠' ? '已付' : '赊欠' }
                                                                    : o
                                                            );
                                                            setOrders(updatedOrders);
                                                        }}
                                                    >
                                                        {order.status === '赊欠' ? '标记已付' : '标记赊欠'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                        
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    background: '#ffffff',
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    setShowShareModal(false);
                                    setSelectedCustomer(null);
                                    setSelectedOrders([]);
                                }}
                            >
                                取消
                            </button>
                            {selectedOrders.length > 0 && (
                                <button
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        // 模拟批量分享功能
                                        alert(`已选择 ${selectedOrders.length} 个订单进行分享`);
                                        setShowShareModal(false);
                                        setSelectedCustomer(null);
                                        setSelectedOrders([]);
                                    }}
                                >
                                    批量分享
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                    color: '#3b82f6',
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
                        fontWeight: '500'
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
                        <TrendingUp size={20} />
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
                        <Users size={20} />
                    </div>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '400'
                    }}>我的</span>
                </Link>
        </div>

        {/* 商品管理模态框 */}
        {showProductModal && (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    width: '90%',
                    maxWidth: '400px',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '1rem'
                        }}>商品管理</h3>
                        
                        <div style={{
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem'
                            }}>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>商品列表</h4>
                                <button
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #3b82f6',
                                        borderRadius: '0.5rem',
                                        background: '#eff6ff',
                                        color: '#3b82f6',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        // 添加新商品
                                        const newProduct = {
                                            id: Date.now().toString(),
                                            name: '新商品',
                                            price: 0,
                                            stock: 0,
                                            createdAt: new Date().toISOString()
                                        };
                                        setProducts([...products, newProduct]);
                                        setSelectedProduct(newProduct);
                                    }}
                                >
                                    添加商品
                                </button>
                            </div>
                            <div style={{
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {products.map((product: any) => (
                                    <div 
                                        key={product.id}
                                        style={{
                                            padding: '0.75rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            marginBottom: '0.5rem',
                                            cursor: 'pointer',
                                            backgroundColor: selectedProduct?.id === product.id ? '#eff6ff' : 'white'
                                        }}
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <p style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }}>{product.name}</p>
                                                <p style={{
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280'
                                                }}>单价: ¥{product.price.toFixed(2)} | 库存: {product.stock}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {selectedProduct && (
                            <div style={{
                                marginBottom: '1.5rem'
                            }}>
                                <h4 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.75rem'
                                }}>商品详情</h4>
                                <div style={{
                                    background: '#f9fafb',
                                    borderRadius: '0.5rem',
                                    padding: '1rem'
                                }}>
                                    <div style={{
                                        marginBottom: '0.75rem'
                                    }}>
                                        <label style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            display: 'block',
                                            marginBottom: '0.25rem'
                                        }}>商品名称</label>
                                        <input
                                            type="text"
                                            value={selectedProduct.name}
                                            onChange={(e) => {
                                                const updatedProducts = products.map((p: any) => 
                                                    p.id === selectedProduct.id 
                                                        ? { ...p, name: e.target.value }
                                                        : p
                                                );
                                                setProducts(updatedProducts);
                                                setSelectedProduct({ ...selectedProduct, name: e.target.value });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        marginBottom: '0.75rem'
                                    }}>
                                        <label style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            display: 'block',
                                            marginBottom: '0.25rem'
                                        }}>单价</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={selectedProduct.price}
                                            onChange={(e) => {
                                                const updatedProducts = products.map((p: any) => 
                                                    p.id === selectedProduct.id 
                                                        ? { ...p, price: parseFloat(e.target.value) || 0 }
                                                        : p
                                                );
                                                setProducts(updatedProducts);
                                                setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) || 0 });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        marginBottom: '0.75rem'
                                    }}>
                                        <label style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            display: 'block',
                                            marginBottom: '0.25rem'
                                        }}>库存</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={selectedProduct.stock}
                                            onChange={(e) => {
                                                const updatedProducts = products.map((p: any) => 
                                                    p.id === selectedProduct.id 
                                                        ? { ...p, stock: parseInt(e.target.value) || 0 }
                                                        : p
                                                );
                                                setProducts(updatedProducts);
                                                setSelectedProduct({ ...selectedProduct, stock: parseInt(e.target.value) || 0 });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem'
                                            }}
                                        />
                                    </div>
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #10b981',
                                            borderRadius: '0.5rem',
                                            background: '#dcfce7',
                                            color: '#059669',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            // 查看商品详情（价格变动和销量）
                                            alert('商品详情查看功能已触发');
                                        }}
                                    >
                                        查看商品详情
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem'
                        }}>
                            <button
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    background: '#ffffff',
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    setShowProductModal(false);
                                    setSelectedProduct(null);
                                }}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;