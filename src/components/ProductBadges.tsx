import { Battery, Shield } from 'lucide-react';

interface ProductBadgesProps {
    batteryHealth?: number | null;
    warrantyStatus?: string | null;
}

export function ProductBadges({ batteryHealth, warrantyStatus }: ProductBadgesProps) {
    const getBatteryColor = (health: number) => {
        if (health >= 80) return 'bg-green-100 text-green-700 border-green-200';
        if (health >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    return (
        <div className="flex flex-wrap gap-2">
            {batteryHealth !== null && batteryHealth !== undefined && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border ${getBatteryColor(batteryHealth)}`}>
                    <Battery className="w-3 h-3" />
                    <span>%{batteryHealth}</span>
                </div>
            )}

            {warrantyStatus && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                    <Shield className="w-3 h-3" />
                    <span>{warrantyStatus}</span>
                </div>
            )}
        </div>
    );
}
