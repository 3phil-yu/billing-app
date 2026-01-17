import { type ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down' | 'neutral';
    trendValue: string;
    description: string;
    icon?: ReactNode;
    className?: string;
}

export default function StatsCard({ 
    title, 
    value, 
    trend, 
    trendValue, 
    description, 
    icon,
    className = '' 
}: StatsCardProps) {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <ArrowUpRight className="text-green-500" size={16} />;
            case 'down':
                return <ArrowDownRight className="text-red-500" size={16} />;
            default:
                return <Minus className="text-muted-foreground" size={16} />;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <div className={`bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-200 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                {icon && (
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {icon}
                    </div>
                )}
            </div>
            
            <div className="mb-4">
                <div className="text-2xl font-bold text-card-foreground mb-1">{value}</div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
                {getTrendIcon()}
                <span className={`font-medium ${getTrendColor()}`}>
                    {trendValue}
                </span>
                <span className="text-muted-foreground">{description}</span>
            </div>
        </div>
    );
}
