
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { MenuItem, Order, Table, OrderStatus, Restaurant, TableStatus, OrderItem, CustomerInfo } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { FirebaseServices } from '@/lib/firebase-services';

// A type for the entire dataset
type AppData = {
    restaurants: Restaurant[];
}

type NewOrder = {
    tableNumber: number;
    items: { menuItemId: string; quantity: number; name: string, price: number }[];
    customer: CustomerInfo;
}

interface AppContextType {
    restaurant: Restaurant | null;
    menuItems: MenuItem[];
    orders: Order[];
    tables: Table[];
    customerInfo: CustomerInfo | null;
    setRestaurantId: (id: string) => void;
    setCustomerInfo: (customer: CustomerInfo | null) => void;
    addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
    updateMenuItem: (item: MenuItem) => Promise<void>;
    deleteMenuItem: (id: string) => Promise<void>;
    addOrder: (order: NewOrder) => Promise<string>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    updateTableStatus: (tableId: number, status: TableStatus) => Promise<void>;
    getOrderById: (orderId: string) => Order | undefined;
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);

    // Load restaurantId from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }
        const savedRestaurantId = localStorage.getItem('restaurantId');
        if (savedRestaurantId) {
            setRestaurantId(savedRestaurantId);
        }
        setIsLoading(false);
    }, []);

    // Load restaurant data and subscribe to orders when restaurantId changes
    useEffect(() => {
        if (!restaurantId) return;

        // Load restaurant data
        const loadData = async () => {
            setIsLoading(true);
            try {
                const rest = await FirebaseServices.getRestaurant(restaurantId);
                if (rest) {
                    setRestaurant(rest);
                    setMenuItems(rest.menu);
                    setTables(rest.tables);
                }
            } catch (error) {
                console.error('Failed to load restaurant data:', error);
            }
            setIsLoading(false);
        };

        loadData();

        // Subscribe to real-time orders updates
        const unsubscribe = FirebaseServices.subscribeToOrders(restaurantId, (newOrders) => {
            setOrders(newOrders);
        });

        return () => {
            unsubscribe();
        };
    }, [restaurantId]);

    const handleSetRestaurantId = (id: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('restaurantId', id);
        }
        setRestaurantId(id);
    };

    const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
        if (!restaurantId) return;
        const newItem: MenuItem = { ...item, id: `menu-${Date.now()}` };
        try {
            await FirebaseServices.addMenuItem(restaurantId, newItem);
            toast({ title: "Success", description: "Menu item added." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to add menu item." });
        }
    };

    const updateMenuItem = async (updatedItem: MenuItem) => {
        try {
            await FirebaseServices.updateMenuItem(updatedItem);
            toast({ title: "Success", description: "Menu item updated." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update menu item." });
        }
    };

    const deleteMenuItem = async (id: string) => {
        try {
            await FirebaseServices.deleteMenuItem(id);
            toast({ title: "Success", description: "Menu item deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete menu item." });
        }
    };

    const addOrder = async (order: NewOrder): Promise<string> => {
        if (!restaurantId || !restaurant) return '';
        const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newOrder: Order = {
            ...order,
            id: `ORD-${restaurant.id.slice(0, 4).toUpperCase()}-${Date.now()}`,
            status: 'Placed',
            timestamp: new Date(),
            total,
            items: order.items.map(i => ({ ...i })),
        };
        try {
            await FirebaseServices.addOrder({ ...newOrder, restaurantId });
            toast({ title: "Order Placed!", description: "Your order has been sent to the kitchen." });
            return newOrder.id;
        } catch (error) {
            toast({ title: "Error", description: "Failed to place order." });
            return '';
        }
    };

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        try {
            await FirebaseServices.updateOrderStatus(orderId, status);
            toast({ title: "Success", description: `Order marked as ${status}.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update order status." });
        }
    };

    const updateTableStatus = async (tableId: number, status: TableStatus) => {
        if (!restaurantId) return;
        try {
            await FirebaseServices.updateTableStatus(restaurantId, tableId, status);
            toast({ title: "Success", description: `Table status updated.` });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update table status." });
        }
    };

    const getOrderById = useCallback((orderId: string): Order | undefined => {
        return orders.find(order => order.id === orderId);
    }, [orders]);

    return (
        <AppContext.Provider value={{
            restaurant,
            menuItems,
            orders,
            tables,
            customerInfo,
            setRestaurantId: handleSetRestaurantId,
            setCustomerInfo,
            addMenuItem,
            updateMenuItem,
            deleteMenuItem,
            addOrder,
            updateOrderStatus,
            updateTableStatus,
            getOrderById,
            isLoading,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppData must be used within an AppProvider');
    }
    return context;
};
