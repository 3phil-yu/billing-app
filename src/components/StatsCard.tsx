import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    icon: LucideIcon;
    description: string;
}

export function StatsCard({ title, value, trend, trendValue, icon: Icon, description }: StatsCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <Icon className="text-muted-foreground" size={18} />
            </div>
            <div className="mt-2 text-3xl font-bold">{value}</div>
            <div className="mt-4 flex items-center text-xs">
                {trend === 'up' && <ArrowUpRight className="text-green-500 mr-1" size={16} />}
                {trend === 'down' && <ArrowDownRight className="text-red-500 mr-1" size={16} />}
                <span className={trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}>
                    {trendValue}
                </span>
                <span className="text-muted-foreground ml-1">{description}</span>
            </div>
        </div>
    );
}
