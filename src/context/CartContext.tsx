'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image?: string;
    slug: string;
    stock: number;
    quantity: number;
    selectedColor?: string; // e.g. "Siyah"
}

// Unique key per product+color combo
function itemKey(id: string, color?: string) {
    return color ? `${id}__${color}` : id;
}

interface CartContext {
    items: CartItem[];
    totalCount: number;
    totalPrice: number;
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string, selectedColor?: string) => void;
    updateQty: (id: string, qty: number, selectedColor?: string) => void;
    clearCart: () => void;
}

const CartCtx = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('ays_cart');
            if (stored) setItems(JSON.parse(stored));
        } catch { }
    }, []);

    // Persist to localStorage on change
    useEffect(() => {
        localStorage.setItem('ays_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const key = itemKey(item.id, item.selectedColor);
            const existing = prev.find(i => itemKey(i.id, i.selectedColor) === key);
            if (existing) {
                if (existing.quantity >= item.stock) return prev;
                return prev.map(i =>
                    itemKey(i.id, i.selectedColor) === key
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: string, selectedColor?: string) => {
        const key = itemKey(id, selectedColor);
        setItems(prev => prev.filter(i => itemKey(i.id, i.selectedColor) !== key));
    }, []);

    const updateQty = useCallback((id: string, qty: number, selectedColor?: string) => {
        const key = itemKey(id, selectedColor);
        setItems(prev => prev.map(i => {
            if (itemKey(i.id, i.selectedColor) !== key) return i;
            if (qty <= 0) return null as any;
            return { ...i, quantity: Math.min(qty, i.stock) };
        }).filter(Boolean));
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalCount = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

    return (
        <CartCtx.Provider value={{ items, totalCount, totalPrice, addItem, removeItem, updateQty, clearCart }}>
            {children}
        </CartCtx.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartCtx);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
}
