"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { MenuItem, Order, Table, OrderStatus, Restaurant, TableStatus, CustomerInfo } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

// Type for admin user
type AdminUser = {
    id: string;
    email: string;
    restaurantId: string;
    name?: string;
    phone?: string;
    role?: string;
    createdAt?: string;
    image?: string;
};

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
    adminUser: AdminUser | null;
    restaurantIdFromAuth: string | null;
    login: (email: string, password: string) => Promise<{ restaurantId: string } | null>;
    signup: (userData: {
        name: string;
        email: string;
        password: string;
        phone: string;
        restaurantName: string;
        address: string;
    }) => Promise<{ restaurantId: string } | null>;
    logout: () => Promise<void>;
    setRestaurantId: (id: string) => void;
    setCustomerInfo: (customer: CustomerInfo | null) => void;
    addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
    updateMenuItem: (item: MenuItem) => Promise<void>;
    deleteMenuItem: (id: string) => Promise<void>;
    addOrder: (order: NewOrder) => Promise<string>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    updateTableStatus: (tableId: number, status: TableStatus) => Promise<void>;
    addTable: (tableData: { id: number; capacity: number }) => Promise<void>;
    deleteTable: (tableId: number) => Promise<void>;
    getOrderById: (orderId: string) => Order | undefined;
    updateAdminProfile: (profileData: { name: string; email: string; phone: string; image?: File }) => Promise<void>;
    isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { toast } = useToast();
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [restaurantIdFromAuth, setRestaurantIdFromAuth] = useState<string | null>(null);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);

    // Initialize and load persisted state
    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Check authentication via API
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                    const user = data.user;
                    setAdminUser({
                        id: user._id,
                        email: user.email,
                        restaurantId: user.restaurantId,
                        name: user.name,
                        phone: user.phone,
                        role: user.role,
                        createdAt: user.createdAt,
                        image: user.image
                    });
                        setRestaurantIdFromAuth(user.restaurantId);

                        if (user.restaurantId) {
                            setRestaurantId(user.restaurantId);
                        }
                    }
                }
            } catch (error) {
                console.error('App initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeApp();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();

            const user = data.user;
            setAdminUser({
                id: user._id,
                email: user.email,
                restaurantId: user.restaurantId,
                name: user.name,
                phone: user.phone,
                role: user.role,
                createdAt: user.createdAt
            });
            setRestaurantIdFromAuth(user.restaurantId);
            setRestaurantId(user.restaurantId);

            if (typeof window !== 'undefined') {
                localStorage.setItem('restaurantId', user.restaurantId || '');
            }

            return { restaurantId: user.restaurantId };
        } catch (error: any) {
            toast({ title: 'Login failed', description: error?.message || 'Invalid credentials' });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (userData: {
        name: string;
        email: string;
        password: string;
        phone: string;
        restaurantName: string;
        address: string;
    }) => {
        try {
            setIsLoading(true);

            // Call the register API endpoint
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    password: userData.password,
                    role: 'admin',
                    restaurantName: userData.restaurantName,
                    address: userData.address
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();

            // Store token and user data
            if (typeof window !== 'undefined') {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('restaurantId', data.user.restaurantId || '');
            }

            setAdminUser({
                id: data.user._id,
                email: data.user.email,
                restaurantId: data.user.restaurantId,
                name: data.user.name,
                phone: data.user.phone,
                role: data.user.role,
                createdAt: data.user.createdAt,
                image: data.user.image
            });
            setRestaurantIdFromAuth(data.user.restaurantId);
            setRestaurantId(data.user.restaurantId);

            toast({ title: 'Success', description: 'Account created successfully!' });
            return { restaurantId: data.user.restaurantId };
        } catch (error: any) {
            toast({ title: 'Signup failed', description: error?.message || 'Failed to create account' });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state and storage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('restaurantId');
            }
            setAdminUser(null);
            setRestaurantId(null);
            setRestaurantIdFromAuth(null);
            setRestaurant(null);
            setMenuItems([]);
            setTables([]);
            setOrders([]);
        }
    };

    // Load restaurant data when restaurantId changes
    useEffect(() => {
        if (!restaurantId) {
            setRestaurant(null);
            setMenuItems([]);
            setTables([]);
            setOrders([]);
            return;
        }

        // Load restaurant data
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [restaurantRes, menuRes, tablesRes, ordersRes] = await Promise.all([
                    fetch(`/api/restaurants?id=${restaurantId}`),
                    fetch(`/api/menu?restaurantId=${restaurantId}`),
                    fetch(`/api/tables?restaurantId=${restaurantId}`),
                    fetch(`/api/orders?restaurantId=${restaurantId}`)
                ]);

                if (restaurantRes.ok) {
                    const data = await restaurantRes.json();
                    setRestaurant(data.data[0] || null);
                }

                if (menuRes.ok) {
                    const data = await menuRes.json();
                    setMenuItems(data.data || []);
                }

                if (tablesRes.ok) {
                    const data = await tablesRes.json();
                    setTables(data.data || []);
                }

                if (ordersRes.ok) {
                    const data = await ordersRes.json();
                    setOrders((data.data || []).map((order: any) => ({
                        ...order,
                        timestamp: new Date(order.timestamp)
                    })));
                }
            } catch (error) {
                console.error('Failed to load restaurant data:', error);
                toast({ title: 'Error', description: 'Failed to load restaurant data' });
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        // Note: Polling disabled to prevent unnecessary Fast Refresh rebuilds in development
        // For real-time updates, consider implementing Server-Sent Events or WebSockets in production
    }, [restaurantId, toast]);

    const handleSetRestaurantId = (id: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('restaurantId', id);
        }
        setRestaurantId(id);
    };

    const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
        if (!restaurantId) return;
        try {
            const newItem = {
                ...item,
                restaurantId,
                id: `menu-${Date.now()}`,
                isAvailable: true
            };
            const response = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            if (!response.ok) {
                throw new Error('Failed to add menu item');
            }
            const data = await response.json();
            setMenuItems(prev => [...prev, data.data]);
            toast({ title: "Success", description: "Menu item added." });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to add menu item." });
        }
    };

    const updateMenuItem = async (updatedItem: MenuItem) => {
        try {
            const response = await fetch('/api/menu', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem),
            });
            if (!response.ok) {
                throw new Error('Failed to update menu item');
            }
            // Refresh menu items
            const data = await response.json();
            setMenuItems(prev => prev.map(item => item.id === updatedItem.id ? data.data : item));
            toast({ title: "Success", description: "Menu item updated." });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to update menu item." });
        }
    };

    const deleteMenuItem = async (id: string) => {
        try {
            const response = await fetch(`/api/menu?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete menu item');
            }
            setMenuItems(prev => prev.filter(item => item.id !== id));
            toast({ title: "Success", description: "Menu item deleted." });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to delete menu item." });
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
            restaurantId,
            customer: {
                name: order.customer.name,
                email: order.customer.email,
                phone: order.customer.phone
            }
        };
        try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to place order');
        }
        toast({ title: "Order Placed!", description: "Your order has been sent to the kitchen." });
        // Refresh orders
        const data = await response.json();
        setOrders(prev => [...prev, data.data]);
        return newOrder.id;
    } catch (error: any) {
        toast({ title: "Error", description: error?.message || "Failed to place order." });
        return '';
    }
    };

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        try {
            const response = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status }),
            });
            if (!response.ok) {
                throw new Error('Failed to update order status');
            }
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
            toast({ title: "Success", description: `Order marked as ${status}.` });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to update order status." });
        }
    };

    const updateTableStatus = async (tableId: number, status: TableStatus) => {
        if (!restaurantId) return;
        try {
            const response = await fetch('/api/tables', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tableId, restaurantId, status }),
            });
            if (!response.ok) {
                throw new Error('Failed to update table status');
            }
            setTables(prev => prev.map(table => table.id === tableId ? { ...table, status } : table));
            toast({ title: "Success", description: `Table status updated.` });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to update table status." });
        }
    };

    const addTable = async (tableData: { id: number; capacity: number }) => {
        if (!restaurantId) return;
        try {
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...tableData, restaurantId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add table');
            }
            const data = await response.json();
            setTables(prev => [...prev, data.data]);
            toast({ title: "Success", description: "Table added successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to add table." });
        }
    };

    const deleteTable = async (tableId: number) => {
        if (!restaurantId) return;
        try {
            const response = await fetch(`/api/tables?id=${tableId}&restaurantId=${restaurantId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete table');
            }
            setTables(prev => prev.filter(table => table.id !== tableId));
            toast({ title: "Success", description: "Table deleted successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to delete table." });
        }
    };

    const getOrderById = useCallback((orderId: string): Order | undefined => {
        return orders.find(order => order.id === orderId);
    }, []);

    const updateAdminProfile = async (profileData: { name: string; email: string; phone: string; image?: File }) => {
        if (!adminUser) return;
        try {
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('email', profileData.email);
            formData.append('phone', profileData.phone);
            if (profileData.image) {
                formData.append('image', profileData.image);
            }

            const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }
            const data = await response.json();
            setAdminUser(prev => prev ? { ...prev, name: profileData.name, email: profileData.email, phone: profileData.phone, image: data.user.image } : null);
            toast({ title: "Success", description: "Profile updated successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error?.message || "Failed to update profile." });
            throw error;
        }
    };

    return (
        <AppContext.Provider value={{
            restaurant,
            menuItems,
            orders,
            tables,
            customerInfo,
            adminUser,
            restaurantIdFromAuth,
            login,
            signup,
            logout,
            setRestaurantId: handleSetRestaurantId,
            setCustomerInfo,
            addMenuItem,
            updateMenuItem,
            deleteMenuItem,
            addOrder,
            updateOrderStatus,
            updateTableStatus,
            addTable,
            deleteTable,
            getOrderById,
            updateAdminProfile,
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
