import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface Props {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumb({ items, className = '' }: Props) {
    return (
        <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm ${className}`}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <div key={index} className="flex items-center gap-1">
                        {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />}
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-white/40 hover:text-white/70 transition-colors font-medium truncate max-w-[120px] md:max-w-none"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={`font-semibold truncate max-w-[160px] md:max-w-none ${isLast ? 'text-white/80' : 'text-white/40'}`}>
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
