import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, Trash2, Key, AlertTriangle, Eye, EyeOff, CheckCircle, User, FileText } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '../components/ui/Toast';
import Modal from '../components/ui/Modal';

export default function Settings() {
    const [apiKey, setApiKey] = useLocalStorage('deepseek_api_key', '');
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

        // DeepSeek API keys don't have a specific prefix format
        // Just validate that it's not empty
        if (!inputValue.trim()) {
            showToast({
                type: 'warning',
                title: 'API密钥格式不正确',
                message: '请输入有效的DeepSeek API密钥'
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
            'deepseek_api_key',
            'deepseek_recognition_prompt'
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
        <div style={{
            minHeight: '100vh',
            background: '#f5f5f5',
            fontFamily: 'PingFang SC, Helvetica Neue, Arial, sans-serif'
        }}>
            {/* 顶部导航栏 */}
            <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
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
                    }}>老俞开单</h1>
                </div>

                {/* 副标题 */}
                <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    position: 'relative',
                    zIndex: 10
                }}>配置应用参数和管理数据</p>
            </div>

            {/* 主体内容 */}
            <div style={{
                padding: '1rem',
                paddingBottom: '8rem'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {/* API配置 */}
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
                            <Key size={18} style={{ color: '#6366f1' }} />
                            API配置
                        </h2>

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
                                    DeepSeek API密钥
                                </label>
                                <div style={{
                                    position: 'relative'
                                }}>
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="请输入您的DeepSeek API密钥"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 5rem 0.75rem 1rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.75rem',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        right: '0.5rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            style={{
                                                padding: '0.5rem',
                                                background: 'transparent',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
                                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                                        >
                                            {showApiKey ? <EyeOff size={16} style={{ color: '#6b7280' }} /> : <Eye size={16} style={{ color: '#6b7280' }} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {apiKey && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginTop: '0.5rem'
                                    }}>
                                        <CheckCircle size={16} style={{ color: '#10b981' }} />
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280'
                                        }}>
                                            当前密钥: {maskApiKey(apiKey)}
                                        </p>
                                    </div>
                                )}
                                
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginTop: '0.5rem'
                                }}>
                                    用于OCR图片识别和AI需求分析功能。
                                    <a 
                                        href="https://platform.deepseek.com/api_keys" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{
                                            color: '#6366f1',
                                            textDecoration: 'none',
                                            marginLeft: '0.25rem'
                                        }}
                                    >
                                        获取API密钥
                                    </a>
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '0.75rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.opacity = '0.9'}
                                onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLElement).style.opacity = '1'}
                            >
                                <Save size={16} />
                                保存配置
                            </button>
                        </div>
                    </div>

                    {/* 智能识别提示词配置 */}
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
                            <Key size={18} style={{ color: '#6366f1' }} />
                            智能识别配置
                        </h2>

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
                                    识别提示词
                                </label>
                                <div style={{
                                    position: 'relative'
                                }}>
                                    <textarea
                                        value={localStorage.getItem('deepseek_recognition_prompt') || ''}
                                        onChange={(e) => localStorage.setItem('deepseek_recognition_prompt', e.target.value)}
                                        placeholder="输入用于智能识别的提示词，例如：'You are an expert in analyzing order images. Extract the order details and return a JSON object with items array, where each item has name, quantity (number), and price (number). Output ONLY valid JSON.'"
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            padding: '0.75rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.75rem',
                                            fontSize: '0.875rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            resize: 'vertical'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                    />
                                </div>
                                
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginTop: '0.5rem'
                                }}>
                                    用于调整智能识别的行为和输出格式。留空使用默认提示词。
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 应用信息 */}
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
                            marginBottom: '1rem'
                        }}>应用信息</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.75rem',
                            fontSize: '0.875rem'
                        }}>
                            <div>
                                <span style={{
                                    color: '#6b7280'
                                }}>应用版本:</span>
                                <span style={{
                                    marginLeft: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>v1.0.0</span>
                            </div>
                            <div>
                                <span style={{
                                    color: '#6b7280'
                                }}>构建时间:</span>
                                <span style={{
                                    marginLeft: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>2024-01-17</span>
                            </div>
                            <div>
                                <span style={{
                                    color: '#6b7280'
                                }}>技术栈:</span>
                                <span style={{
                                    marginLeft: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>React + TypeScript + Vite</span>
                            </div>
                            <div>
                                <span style={{
                                    color: '#6b7280'
                                }}>AI引擎:</span>
                                <span style={{
                                    marginLeft: '0.5rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>DeepSeek</span>
                            </div>
                        </div>
                    </div>

                    {/* 数据管理 */}
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
                            marginBottom: '1rem'
                        }}>数据管理</h2>
                        
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            <div style={{
                                background: '#f9fafb',
                                borderRadius: '0.75rem',
                                padding: '1rem'
                            }}>
                                <h3 style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }}>数据存储</h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    marginBottom: '1rem'
                                }}>
                                    所有数据存储在浏览器本地，不会上传到服务器。包括客户信息、订单记录和设置配置。
                                </p>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                }}>
                                    <p>• 客户数据: {JSON.parse(localStorage.getItem('billing_customers') || '[]').length} 条记录</p>
                                    <p>• 订单数据: {JSON.parse(localStorage.getItem('billing_orders') || '[]').length} 条记录</p>
                                    <p>• 存储大小: 约 {Math.round(JSON.stringify(localStorage).length / 1024)} KB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 危险区域 */}
                    <div style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '1rem',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                    }}>
                        <h2 style={{
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: '#ef4444',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <AlertTriangle size={18} />
                            危险区域
                        </h2>
                        
                        <div style={{
                            background: '#fef2f2',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            border: '1px solid #fee2e2'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#dc2626',
                                        marginBottom: '0.25rem'
                                    }}>重置所有数据</h3>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#b91c1c'
                                    }}>
                                        将清除所有客户信息、订单记录、常用商品和API配置。此操作不可撤销。
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowResetModal(true)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                                    onMouseOut={(e) => (e.target as HTMLElement).style.opacity = '1'}
                                >
                                    <Trash2 size={14} />
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
                <div style={{
                    textAlign: 'center',
                    padding: '2rem 1rem'
                }}>
                    <AlertTriangle size={48} style={{ color: '#ef4444', marginBottom: '1.5rem' }} />
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }}>
                        您确定要重置所有数据吗？
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '2rem'
                    }}>
                        此操作将永久删除所有客户信息、订单记录和设置配置，且无法恢复。
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem'
                    }}>
                        <button
                            onClick={() => setShowResetModal(false)}
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
                            onClick={handleReset}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                border: 'none',
                                borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => (e.target as HTMLElement).style.opacity = '0.9'}
                            onMouseOut={(e) => (e.target as HTMLElement).style.opacity = '1'}
                        >
                            确认重置
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
                    color: '#6366f1',
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
                        fontWeight: '500'
                    }}>我的</span>
                </Link>
            </div>
        </div>
    );
}