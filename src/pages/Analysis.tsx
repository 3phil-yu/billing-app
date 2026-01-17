import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, FileText, DollarSign, BarChart3, Users, Share2, CheckCircle, XCircle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';

function Analysis() {
    const [activeTab, setActiveTab] = useState('debt'); // debt or all
    const { orders, updateOrderStatus } = useOrders();
    const { customers } = useCustomers();

    // 从实际订单数据中过滤赊欠订单和全部订单
    const debtOrders = useMemo(() => {
        return orders.filter(order => order.status === '赊欠');
    }, [orders]);

    const allOrders = useMemo(() => {
        return orders;
    }, [orders]);

    const totalDebt = debtOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const oldestDebtDays = 8; // 最长赊欠天数
    const oldestDebtDate = '2026-01-07'; // 最长赊欠日期

    // 更新订单状态
    const handleUpdateOrderStatus = (orderId: string, currentStatus: string) => {
        const newStatus = currentStatus === '赊欠' ? '已付' : '赊欠';
        updateOrderStatus(orderId, newStatus as '赊欠' | '已付');
    };

    // 分享订单
    const shareOrder = (order: any) => {
        // 模拟分享功能
        alert('订单分享功能已触发');
    };

    // 一周趋势数据
    const weekTrends = [
        { date: '01-11', orders: 2, amount: 150 },
        { date: '01-12', orders: 1, amount: 80 },
        { date: '01-13', orders: 1, amount: 100 },
        { date: '01-14', orders: 1, amount: 45 },
        { date: '01-15', orders: 0, amount: 0 },
        { date: '01-16', orders: 0, amount: 0 },
        { date: '01-17', orders: 0, amount: 0 }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f5',
            fontFamily: 'PingFang SC, Helvetica Neue, Arial, sans-serif'
        }}>
            {/* 顶部导航栏 */}
            <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '1.5rem 1rem',
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

                {/* 标题 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <h1 style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>经营分析</h1>
                </div>

                {/* 赊欠信息 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }}>
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.8)'
                            }}>赊欠金额</p>
                            <p style={{
                                fontSize: '0.75rem',
                                color: 'rgba(255, 255, 255, 0.6)'
                            }}>最长赊欠至今{oldestDebtDays}天({oldestDebtDate})</p>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '0.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.75rem',
                                fontWeight: 'bold',
                                color: 'white'
                            }}>¥{totalDebt}</h2>
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255, 255, 255, 0.8)'
                            }}>/{debtOrders.length}单</p>
                        </div>
                    </div>
                    <button style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                    }}>
                        赊欠对账 →
                    </button>
                </div>
            </div>

            {/* 主体内容 */}
            <div style={{
                padding: '1rem',
                paddingBottom: '8rem'
            }}>
                {/* 一周趋势图 */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '1rem'
                    }}>一周趋势</h3>
                    
                    <div style={{
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'space-between',
                        height: '120px',
                        gap: '0.5rem'
                    }}>
                        {weekTrends.map((trend, index) => (
                            <div key={index} style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(trend.amount / 200) * 100}%`,
                                    background: 'linear-gradient(180deg, #10b981 0%, #34d399 100%)',
                                    borderRadius: '0.25rem 0.25rem 0 0',
                                    position: 'relative'
                                }}>
                                    {trend.amount > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '0.75rem',
                                            color: '#10b981',
                                            fontWeight: '500'
                                        }}>
                                            ¥{trend.amount}
                                        </div>
                                    )}
                                </div>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                }}>{trend.date}</p>
                                <p style={{
                                    fontSize: '0.625rem',
                                    color: '#9ca3af'
                                }}>{trend.orders}单</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 订单标签页 */}
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                }}>
                    {/* 标签栏 */}
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <button
                            onClick={() => setActiveTab('debt')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: activeTab === 'debt' ? 'white' : '#f9fafb',
                                border: 'none',
                                borderBottom: activeTab === 'debt' ? '2px solid #10b981' : 'none',
                                fontSize: '0.875rem',
                                fontWeight: activeTab === 'debt' ? '500' : '400',
                                color: activeTab === 'debt' ? '#10b981' : '#6b7280'
                            }}
                        >
                            赊欠订单
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                background: activeTab === 'all' ? 'white' : '#f9fafb',
                                border: 'none',
                                borderBottom: activeTab === 'all' ? '2px solid #10b981' : 'none',
                                fontSize: '0.875rem',
                                fontWeight: activeTab === 'all' ? '500' : '400',
                                color: activeTab === 'all' ? '#10b981' : '#6b7280'
                            }}
                        >
                            全部订单
                            {activeTab === 'all' && (
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    background: '#ef4444',
                                    borderRadius: '50%',
                                    marginLeft: '4px',
                                    verticalAlign: 'middle'
                                }} />
                            )}
                        </button>
                    </div>

                    {/* 订单列表 */}
                    <div style={{
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}>
                        {(activeTab === 'debt' ? debtOrders : allOrders).map((order, index) => {
                            // 获取客户信息
                            const customer = customers.find(c => c.id === order.customerId);
                            const customerName = customer ? customer.name : '未知客户';
                            
                            return (
                                <div key={order.id} style={{
                                    padding: '1rem',
                                    borderBottom: index < (activeTab === 'debt' ? debtOrders.length - 1 : allOrders.length - 1) ? '1px solid #f3f4f6' : 'none'
                                }}>
                                    {/* 订单头部 */}
                                    <div style={{
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '0.25rem'
                                        }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                color: '#374151'
                                            }}>{order.date}</p>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                color: order.status === '赊欠' ? '#f97316' : '#10b981'
                                            }}>{order.status} ¥{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280'
                                        }}>客户: {customerName}</p>
                                    </div>

                                    {/* 商品列表 */}
                                    <div style={{
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                            gap: '0.5rem',
                                            marginBottom: '0.5rem',
                                            paddingBottom: '0.5rem',
                                            borderBottom: '1px solid #f3f4f6'
                                        }}>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontWeight: '500'
                                            }}>货品</p>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                textAlign: 'center'
                                            }}>数量(重量)</p>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                textAlign: 'right'
                                            }}>单价</p>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                textAlign: 'right'
                                            }}>小计</p>
                                        </div>

                                        {order.items.map((item, itemIndex) => (
                                            <div key={item.id || itemIndex} style={{
                                                display: 'grid',
                                                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                                gap: '0.5rem',
                                                alignItems: 'center',
                                                paddingVertical: '0.25rem'
                                            }}>
                                                <p style={{
                                                    fontSize: '0.875rem',
                                                    color: '#374151'
                                                }}>{itemIndex + 1}.{item.name}</p>
                                                <p style={{
                                                    fontSize: '0.875rem',
                                                    color: '#6b7280',
                                                    textAlign: 'center'
                                                }}>{item.quantity}</p>
                                                <p style={{
                                                    fontSize: '0.875rem',
                                                    color: '#6b7280',
                                                    textAlign: 'right'
                                                }}>{item.price}</p>
                                                <p style={{
                                                    fontSize: '0.875rem',
                                                    color: '#6b7280',
                                                    textAlign: 'right'
                                                }}>{(item.quantity * item.price).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* 操作按钮 */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        marginTop: '0.75rem'
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
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem'
                                            }}
                                            onClick={() => shareOrder(order)}
                                        >
                                            <Share2 size={14} />
                                            分享订单
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
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.25rem'
                                            }}
                                            onClick={() => handleUpdateOrderStatus(order.id, order.status)}
                                        >
                                            {order.status === '赊欠' ? (
                                                <>
                                                    <CheckCircle size={14} />
                                                    标记已付
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={14} />
                                                    标记赊欠
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* 空状态 */}
                        {(activeTab === 'debt' ? debtOrders : allOrders).length === 0 && (
                            <div style={{
                                padding: '3rem 1rem',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#9ca3af'
                                }}>暂无订单</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                    color: '#10b981',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        width: '2rem',
                        height: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BarChart3 size={20} />
                    </div>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '500'
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
        </div>
    );
}

export default Analysis;