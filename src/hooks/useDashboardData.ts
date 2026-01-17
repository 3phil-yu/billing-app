import { useState, useEffect } from 'react';

export interface DashboardData {
    todaySales: number;
    orders: number;
    newCustomers: number;
    salesTrend: Array<{ name: string; sales: number }>;
}

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setData({
                todaySales: 12580.00,
                orders: 45,
                newCustomers: 12,
                salesTrend: [
                    { name: 'Mon', sales: 4000 },
                    { name: 'Tue', sales: 3000 },
                    { name: 'Wed', sales: 2000 },
                    { name: 'Thu', sales: 2780 },
                    { name: 'Fri', sales: 1890 },
                    { name: 'Sat', sales: 2390 },
                    { name: 'Sun', sales: 3490 },
                ]
            });
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return { data, loading };
}
