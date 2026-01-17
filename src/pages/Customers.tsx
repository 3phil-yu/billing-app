import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Search, Plus, Phone, Mail, User, Calendar, DollarSign, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';

export default function Customers() {
    const { customers, loading, addCustomer } = useCustomers();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAmounts, setShowAmounts] = useState(true);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.name.trim()) {
            newErrors.name = '请输入客户姓名';
        }
        
        if (!formData.phone.trim()) {
            newErrors.phone = '请输入联系电话';
        } else if (!/^1[3-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = '请输入有效的手机号码';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '请输入有效的邮箱地址';
        }

        // 检查是否已存在相同电话号码的客户
        if (customers.some(c => c.phone === formData.phone)) {
            newErrors.phone = '该电话号码已存在';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        addCustomer(formData);
        setFormData({ name: '', phone: '', email: '' });
        setErrors({});
        setIsModalOpen(false);
        
        showToast({
            type: 'success',
            title: '客户添加成功',
            message: `${formData.name} 已添加到客户列表`
        });
    };

    const formatCurrency = (amount: number) => {
        return showAmounts ? `¥${amount.toLocaleString()}` : '¥***';
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* 页面头部 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-card-foreground mb-2">客户管理</h1>
                        <p className="text-muted-foreground">
                            管理您的客户信息，共 {customers.length} 位客户
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAmounts(!showAmounts)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title={showAmounts ? '隐藏金额' : '显示金额'}
                        >
                            {showAmounts ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            添加客户
                        </button>
                    </div>
                </div>

                {/* 搜索栏 */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="搜索客户姓名、电话或邮箱..."
                            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* 客户列表 */}
                {filteredCustomers.length === 0 ? (
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-card-foreground mb-2">
                            {searchTerm ? '未找到匹配的客户' : '暂无客户'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchTerm ? '尝试使用其他关键词搜索' : '添加您的第一位客户开始管理'}
                        </p>
                        {!searchTerm && (
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                添加客户
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCustomers.map((customer) => (
                            <div 
                                key={customer.id} 
                                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-200 group"
                            >
                                {/* 客户头像和基本信息 */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                                {customer.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar size={12} />
                                                {formatDate(customer.lastOrderDate)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 操作按钮 */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            className="p-1 hover:bg-muted rounded transition-colors"
                                            title="编辑客户"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button 
                                            className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                                            title="删除客户"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* 累计支出 */}
                                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                                    <div className="text-xs text-muted-foreground mb-1">累计支出</div>
                                    <div className="font-bold text-lg flex items-center gap-1 text-green-600">
                                        <DollarSign size={16} />
                                        {formatCurrency(customer.totalSpent)}
                                    </div>
                                </div>

                                {/* 联系信息 */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone size={14} />
                                        <span className="truncate">{customer.phone}</span>
                                    </div>
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail size={14} />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 添加客户模态框 */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormData({ name: '', phone: '', email: '' });
                    setErrors({});
                }}
                title="添加新客户"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="customer-name" className="block text-sm font-medium text-card-foreground mb-2">
                            客户姓名 *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                id="customer-name"
                                type="text"
                                placeholder="请输入客户姓名"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.name 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-border focus:ring-primary'
                                }`}
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: '' });
                                }}
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="customer-phone" className="block text-sm font-medium text-card-foreground mb-2">
                            联系电话 *
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                id="customer-phone"
                                type="tel"
                                placeholder="请输入手机号码"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.phone 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-border focus:ring-primary'
                                }`}
                                value={formData.phone}
                                onChange={(e) => {
                                    setFormData({ ...formData, phone: e.target.value });
                                    if (errors.phone) setErrors({ ...errors, phone: '' });
                                }}
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="customer-email" className="block text-sm font-medium text-card-foreground mb-2">
                            邮箱地址
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                id="customer-email"
                                type="email"
                                placeholder="请输入邮箱地址（可选）"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    errors.email 
                                        ? 'border-red-300 focus:ring-red-500' 
                                        : 'border-border focus:ring-primary'
                                }`}
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) setErrors({ ...errors, email: '' });
                                }}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setFormData({ name: '', phone: '', email: '' });
                                setErrors({});
                            }}
                            className="flex-1 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            添加客户
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
