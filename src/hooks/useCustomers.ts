import { useLocalStorage } from './useLocalStorage';

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    totalSpent: number;
    totalPaid: number;
    recentOrders: number;
    lastOrderDate: string;
}

const initialMockCustomers: Customer[] = [
    { id: '1', name: 'Alice Johnson', phone: '138-0000-0001', email: 'alice@example.com', totalSpent: 12500, totalPaid: 10000, recentOrders: 5, lastOrderDate: '2023-10-25' },
    { id: '2', name: 'Bob Smith', phone: '139-0000-0002', email: 'bob@example.com', totalSpent: 5400, totalPaid: 5400, recentOrders: 2, lastOrderDate: '2023-10-24' },
];

export function useCustomers() {
    const [storedCustomers, setCustomers] = useLocalStorage<Customer[]>('billing_customers', initialMockCustomers);
    const customers = Array.isArray(storedCustomers) ? storedCustomers : [];

    const addCustomer = (customer: Omit<Customer, 'id' | 'totalSpent' | 'totalPaid' | 'recentOrders' | 'lastOrderDate'>) => {
        const newCustomer: Customer = {
            ...customer,
            id: Math.random().toString(36).substr(2, 9),
            totalSpent: 0,
            totalPaid: 0,
            recentOrders: 0,
            lastOrderDate: new Date().toISOString().split('T')[0]
        };
        setCustomers([newCustomer, ...customers]);
    };

    const updateCustomerSpending = (customerId: string, amount: number) => {
        const date = new Date().toISOString().split('T')[0];
        setCustomers(customers.map(c =>
            c.id === customerId
                ? { ...c, totalSpent: c.totalSpent + amount, lastOrderDate: date }
                : c
        ));
    };

    return { customers, loading: false, addCustomer, updateCustomerSpending };
}
