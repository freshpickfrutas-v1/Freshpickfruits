import React, { createContext, useContext, useState } from 'react';
import { FruitItem } from '../types';
import { CartItem } from '../components/CartDrawer';

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addToCart: (fruit: FruitItem, quantity?: number) => void;
  updateQuantity: (fruitId: string, quantity: number) => void;
  removeFromCart: (fruitId: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Cart state lives above the router so it survives moving between Home, Recetas and Blog. */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);

  const addToCart = (fruit: FruitItem, quantity?: number) => {
    const step = (fruit.defaultGramUnit === 125 || fruit.defaultGramUnit === 250) ? 2 : 1;
    const qtyToAdd = quantity ?? step;
    setItems(prev => {
      const existing = prev.find(item => item.fruit.id === fruit.id);
      if (existing) {
        return prev.map(item =>
          item.fruit.id === fruit.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      return [...prev, { fruit, quantity: qtyToAdd }];
    });
  };

  const updateQuantity = (fruitId: string, quantity: number) => {
    setItems(prev =>
      prev.map(item => (item.fruit.id === fruitId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (fruitId: string) => {
    setItems(prev => prev.filter(item => item.fruit.id !== fruitId));
  };

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalCount, isOpen, setOpen, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
