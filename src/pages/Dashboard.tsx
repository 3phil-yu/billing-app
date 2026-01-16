import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
// import { useCustomers } from '../hooks/useCustomers';
import {
    ChevronRight,
    Home,
    MoreHorizontal,
    ShoppingBag
} from 'lucide-react';

export default function Dashboard() {
    const { orders } = useOrders();
    //  const { customers } = useCustomers();
    const [activeTab, setActiveTab] = useState<'debt' | 'all'>('debt');

    // Grouping orders by date
    const groupedOrders = orders.reduce((acc: any, order) => {
        const date = order.date.split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {});

    const dates = Object.keys(groupedOrders).sort((a, b) => b.localeCompare(a));

    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const orderCount = orders.length;

    return (
        <div className="max-w-md mx-auto min-h-screen bg-[#f8f9fa] flex flex-col pb-24 text-[#333]">
            {/* Top Navigation Bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
                <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <Home size={22} className="text-[#666]" />
                </button>
                <h1 className="text-[17px] font-bold">采购对账单</h1>
                <div className="flex items-center gap-3">
                    <button className="p-1 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 border border-gray-200 rounded-full px-2">
                        <MoreHorizontal size={18} className="text-[#333]" />
                        <div className="w-4 h-4 rounded-full border-2 border-[#333] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#333]"></div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Store Information */}
            <div className="bg-white px-4 py-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#e8f5e9] rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#10b981] rounded-md flex items-center justify-center text-white">
                        <ShoppingBag size={20} />
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-[18px] font-bold leading-tight">李芳川妹子特菜</h2>
                    <div className="flex items-center gap-1 text-[#666] mt-0.5">
                        <span className="text-[14px] font-medium text-[#333]">俞哥</span>
                        <span className="text-[13px] opacity-70">131****3009</span>
                    </div>
                </div>
            </div>

            {/* Summary Card */}
            <div className="px-3 mt-1">
                <div className="bg-[#10b981] rounded-xl p-5 text-white shadow-lg shadow-green-900/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <p className="text-[13px] opacity-90">赊欠金额</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-[28px] font-bold">¥ {totalSales.toLocaleString()}</span>
                                <span className="text-[14px] opacity-90">/ {orderCount}单</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] opacity-80">最长赊欠距今8天(2026-01-07)</p>
                        </div>
                    </div>

                    <div className="flex justify-end mt-2">
                        <button className="bg-white/95 text-[#10b981] px-4 py-2 rounded-lg text-[14px] font-bold flex items-center gap-1 shadow-sm hover:bg-white transition-colors">
                            赊还对账 <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex mt-4 px-3">
                <div className="flex-1 flex bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('debt')}
                        className={`flex-1 py-2.5 rounded-lg text-[15px] font-bold transition-all ${activeTab === 'debt' ? 'bg-white text-[#333] shadow-sm' : 'text-[#666]'}`}
                    >
                        赊欠订单
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2.5 rounded-lg text-[15px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'all' ? 'bg-white text-[#333] shadow-sm' : 'text-[#666]'}`}
                    >
                        全部订单
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-0.5"></div>
                    </button>
                </div>
            </div>

            {/* Order List */}
            <div className="px-3 mt-4 space-y-4">
                {dates.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingBag size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-[14px]">暂无相关订单记录</p>
                    </div>
                )}
                {dates.map(date => (
                    <div key={date} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50">
                        {/* Date Header */}
                        <div className="px-4 py-3 flex justify-between items-center border-b border-gray-50">
                            <span className="text-[15px] font-bold text-[#333]">{date}</span>
                            <div className="flex items-center gap-1">
                                <span className="text-[14px] font-bold text-[#f97316]">赊欠 {groupedOrders[date].reduce((sum: number, o: any) => sum + o.totalAmount, 0)}元</span>
                            </div>
                        </div>

                        {/* Order Items Table Style */}
                        <div className="px-4 py-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[12px] text-gray-400">
                                        <th className="font-normal text-left pb-2">货品</th>
                                        <th className="font-normal text-center pb-2">数量(重量)</th>
                                        <th className="font-normal text-center pb-2">单价</th>
                                        <th className="font-normal text-right pb-2">小计</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {groupedOrders[date].map((order: any) => (
                                        order.items.map((item: any, idx: number) => (
                                            <tr key={`${order.id}-${idx}`} className="text-[14px]">
                                                <td className="py-3 font-medium text-[#333] w-2/5">
                                                    {idx + 1}.{item.name}
                                                </td>
                                                <td className="py-3 text-center text-[#333]">
                                                    {item.quantity}件
                                                </td>
                                                <td className="py-3 text-center text-[#333]">
                                                    {item.price}
                                                </td>
                                                <td className="py-3 text-right font-bold text-[#333]">
                                                    {item.quantity * item.price}
                                                </td>
                                            </tr>
                                        ))
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Promotional Bar - Sticky or at end of content */}
            <div className="mt-8 px-3 flex gap-3 h-12">
                <button className="flex-1 bg-white border border-[#10b981] text-[#10b981] rounded-full text-[14px] font-bold hover:bg-green-50 transition-colors">
                    获取账单推送
                </button>
                <button className="flex-1 bg-[#10b981] text-white rounded-full text-[14px] font-bold flex items-center justify-center gap-1 hover:bg-[#059669] transition-colors relative">
                    试用菜小秘
                    <span className="absolute -top-1 right-2 bg-[#f97316] text-[9px] px-1 py-0.5 rounded-sm font-bold flex items-center scale-90">热</span>
                </button>
            </div>
        </div>
    );
}

