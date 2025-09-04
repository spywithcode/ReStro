
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { MenuItem, Order, Table, OrderStatus, Restaurant, restaurants as initialRestaurants, TableStatus, OrderItem, CustomerInfo } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// Define a key for localStorage
const LOCAL_STORAGE_KEY = 'qrmenu-app-data';

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
    addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
    updateMenuItem: (item: MenuItem) => void;
    deleteMenuItem: (id: string) => void;
    addOrder: (order: NewOrder) => string;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    updateTableStatus: (tableId: number, status: TableStatus) => void;
    getOrderById: (orderId: string) => Order | undefined;
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to get data from localStorage
const loadDataFromStorage = (): AppData => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
        return { restaurants: initialRestaurants };
    }

    try {
        const data = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (data) {
            // Need to parse dates correctly
            const parsedData = JSON.parse(data);
            parsedData.restaurants.forEach((r: Restaurant) => {
                r.orders.forEach((o: Order) => {
                    o.timestamp = new Date(o.timestamp);
                });
            });
            return parsedData;
        }
    } catch (error) {
        console.error("Failed to load or parse data from localStorage", error);
    }
    // If nothing in storage, use initial data
    return { restaurants: initialRestaurants };
};

// Helper to save data to localStorage
const saveDataToStorage = (data: AppData) => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        // Dispatch a storage event to notify other tabs/windows
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Failed to save data to localStorage", error);
    }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [appData, setAppData] = useState<AppData>({ restaurants: initialRestaurants });
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const restaurant = restaurantId ? appData.restaurants.find(r => r.id === restaurantId) || null : null;
    const menuItems = restaurant?.menu || [];
    const orders = restaurant?.orders || [];
    const tables = restaurant?.tables || [];

    // This effect runs on mount to initialize the restaurantId and load data from localStorage
    useEffect(() => {
        // Check if we're on the client side
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        // Load data from localStorage
        const loadedData = loadDataFromStorage();
        setAppData(loadedData);

        const savedRestaurantId = localStorage.getItem('restaurantId');
        const idToLoad = savedRestaurantId || loadedData.restaurants[0]?.id;
        if (idToLoad) {
            setRestaurantId(idToLoad);
        }
        setIsLoading(false);
    }, []);

    // This effect listens for storage changes from other tabs
    useEffect(() => {
        // Check if we're on the client side
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = () => {
            console.log("Storage changed, reloading data.");
            setAppData(loadDataFromStorage());
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateGlobalData = (updatedRestaurants: Restaurant[]) => {
        const newData = { ...appData, restaurants: updatedRestaurants };
        setAppData(newData);
        saveDataToStorage(newData);
    };

    const handleSetRestaurantId = (id: string) => {
        // Check if we're on the client side
        if (typeof window !== 'undefined') {
            localStorage.setItem('restaurantId', id);
        }
        setRestaurantId(id);
    };

    const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
        if (!restaurantId) return;
        const newItem = { ...item, id: `menu-${Date.now()}` };
        const updatedRestaurants = appData.restaurants.map(r => 
            r.id === restaurantId ? { ...r, menu: [...r.menu, newItem] } : r
        );
        updateGlobalData(updatedRestaurants);
        toast({ title: "Success", description: "Menu item added." });
    };

    const updateMenuItem = (updatedItem: MenuItem) => {
        if (!restaurantId) return;
        const updatedRestaurants = appData.restaurants.map(r => 
            r.id === restaurantId ? { ...r, menu: r.menu.map(item => item.id === updatedItem.id ? updatedItem : item) } : r
        );
        updateGlobalData(updatedRestaurants);
        toast({ title: "Success", description: "Menu item updated." });
    };

    const deleteMenuItem = (id: string) => {
        if (!restaurantId) return;
        const updatedRestaurants = appData.restaurants.map(r => 
            r.id === restaurantId ? { ...r, menu: r.menu.filter(item => item.id !== id) } : r
        );
        updateGlobalData(updatedRestaurants);
        toast({ title: "Success", description: "Menu item deleted." });
    };
    
    const addOrder = (order: NewOrder): string => {
        if (!restaurant) return '';
        const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newOrder: Order = {
            ...order,
            id: `ORD-${restaurant.id.slice(0, 4).toUpperCase()}-${Date.now()}`,
            status: 'Placed',
            timestamp: new Date(),
            total,
            items: order.items.map(i => ({...i}))
        };
        
        const updatedRestaurants = appData.restaurants.map(r => {
            if (r.id === restaurant.id) {
                return {
                    ...r,
                    orders: [...r.orders, newOrder],
                    tables: r.tables.map(table => table.id === order.tableNumber ? { ...table, status: 'Occupied' as TableStatus } : table)
                };
            }
            return r;
        });

        updateGlobalData(updatedRestaurants);
        toast({ title: "Order Placed!", description: "Your order has been sent to the kitchen." });
        return newOrder.id;
    };
    
    const updateOrderStatus = (orderId: string, status: OrderStatus) => {
         if (!restaurantId) return;
         const updatedRestaurants = appData.restaurants.map(r => {
            if (r.id === restaurantId) {
                const orderToUpdate = r.orders.find(o => o.id === orderId);
                if (status === 'Completed' && orderToUpdate) {
                     return {
                        ...r,
                        orders: r.orders.map(order => order.id === orderId ? { ...order, status } : order),
                        tables: r.tables.map(table => table.id === orderToUpdate.tableNumber ? { ...table, status: 'Requires-Cleaning' as TableStatus } : table)
                    };
                }
                return { ...r, orders: r.orders.map(order => order.id === orderId ? { ...order, status } : order) };
            }
            return r;
        });
        updateGlobalData(updatedRestaurants);
        toast({ title: "Success", description: `Order marked as ${status}.` });
    };

    const updateTableStatus = (tableId: number, status: TableStatus) => {
        if (!restaurantId) return;
        const updatedRestaurants = appData.restaurants.map(r => 
            r.id === restaurantId ? { ...r, tables: r.tables.map(table => table.id === tableId ? { ...table, status } : table) } : r
        );
        updateGlobalData(updatedRestaurants);
        toast({ title: "Success", description: `Table status updated.` });
    };
    
    const getOrderById = useCallback((orderId: string): Order | undefined => {
        const currentRestaurant = appData.restaurants.find(r => r.id === restaurantId);
        return currentRestaurant?.orders.find(order => order.id === orderId);
    }, [appData, restaurantId]);

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
