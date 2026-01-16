import { useLocalStorage } from './useLocalStorage';

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    date: string; // ISO Date string
    items: OrderItem[];
    totalAmount: number;
    customerId?: string; // Optional link to customer
    status: 'pending' | 'completed' | 'cancelled';
}

export function useOrders() {
    const [orders, setOrders] = useLocalStorage<Order[]>('billing_orders', []);

    const addOrder = (items: OrderItem[], customerId?: string) => {
        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const newOrder: Order = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
            items,
            totalAmount,
            customerId,
            status: 'completed'
        };
        setOrders([newOrder, ...orders]);
        return newOrder;
    };

    const getDailySales = () => {
        const today = new Date().toISOString().split('T')[0];
        const safeOrders = Array.isArray(orders) ? orders : [];
        const todayOrders = safeOrders.filter(o => o?.date?.startsWith(today));
        const totalSales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        // Group by day for last 7 days for charts
        const salesTrend = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const dayTotal = safeOrders
                .filter(o => o?.date?.startsWith(dayStr))
                .reduce((sum, o) => sum + o.totalAmount, 0);

            salesTrend.push({ name: dayName, sales: dayTotal });
        }

        return {
            todaySales: totalSales,
            ordersCount: todayOrders.length,
            salesTrend
        };
    };

    return { orders, addOrder, getDailySales };
}
