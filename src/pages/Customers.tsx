import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Search, Plus, Phone, Mail, User, Calendar, DollarSign, X } from 'lucide-react';

export default function Customers() {
    const { customers, loading, addCustomer } = useCustomers();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addCustomer(formData);
        setFormData({ name: '', phone: '', email: '' });
        setIsModalOpen(false);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in relative z-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">客户管理</h1>
                    <p className="text-muted-foreground">管理您的客户基础</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary gap-2 shadow-lg shadow-primary/20">
                    <Plus size={20} />
                    添加客户
                </button>
            </div>

            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 max-w-md focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <Search size={20} className="text-muted-foreground" />
                <input
                    type="text"
                    placeholder="按姓名、电话或邮箱搜索..."
                    className="bg-transparent border-none outline-none w-full text-foreground placeholder-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{customer.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar size={12} />
                                        Last: {customer.lastOrderDate}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">累计支出</div>
                                <div className="font-bold flex items-center justify-end gap-1 text-green-500">
                                    <DollarSign size={14} />
                                    {customer.totalSpent.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone size={16} />
                                {customer.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail size={16} />
                                {customer.email}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6">添加新客户</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">全名</label>
                                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2">
                                    <User size={18} className="text-muted-foreground" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="张三"
                                        className="bg-transparent border-none outline-none w-full"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">电话号码</label>
                                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2">
                                    <Phone size={18} className="text-muted-foreground" />
                                    <input
                                        required
                                        type="tel"
                                        placeholder="13800000000"
                                        className="bg-transparent border-none outline-none w-full"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">邮箱</label>
                                <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2">
                                    <Mail size={18} className="text-muted-foreground" />
                                    <input
                                        type="email"
                                        placeholder="zhangsan@example.com"
                                        className="bg-transparent border-none outline-none w-full"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">取消</button>
                                <button type="submit" className="btn btn-primary">保存客户</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
