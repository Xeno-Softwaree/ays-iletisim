import ProductCard from './ProductCard';
import { Smartphone } from 'lucide-react';

interface Product {
    id: string;
    slug: string;
    name: string;
    price: number;
    images: string[];
    condition: 'NEW' | 'USED';
    stock: number;
    batteryHealth: number | null;
    warrantyStatus: string | null;
    brand: { name: string } | null;

    // Additional fields might be present in Prisma response but we only need above for card
    [key: string]: any;
}

interface Props {
    products: Product[];
}

export default function ProductGrid({ products }: Props) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300 border border-slate-100 rounded-[3rem] bg-white shadow-sm">
                <Smartphone className="w-20 h-20 mb-6 text-slate-100" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">Ürün Bulunamadı</h3>
                <p className="text-slate-500 font-medium">Seçilen kriterlere uygun ürün mevcut değil.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
