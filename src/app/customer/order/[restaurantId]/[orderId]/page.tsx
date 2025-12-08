"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { CheckCircle, Clock, ChefHat, Truck, X, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

type OrderItem = {
    menuItemId: string;
    quantity: number;
    name: string;
    price: number;
};

type Order = {
    id: string;
    status: 'Placed' | 'Preparing' | 'Ready' | 'Delivered';
    timestamp: string;
    total: number;
    items: OrderItem[];
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    tableNumber: number;
};

export default function CustomerOrderPage() {
    const { restaurantId, orderId } = useParams<{ restaurantId: string, orderId: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if customer is logged in
        const storedCustomerInfo = localStorage.getItem('customerInfo');
        if (!storedCustomerInfo) {
            // Redirect to login if not logged in
            router.push(`/customer/login/${restaurantId}/1`);
            return;
        }

        // Fetch order and restaurant data
        const fetchData = async () => {
            try {
                const [orderRes, restaurantRes] = await Promise.all([
                    fetch(`/api/orders?id=${orderId}`),
                    fetch(`/api/restaurants?id=${restaurantId}`)
                ]);

                if (orderRes.ok) {
                    const orderData = await orderRes.json();
                    if (orderData.data && orderData.data.length > 0) {
                        setOrder(orderData.data[0]);
                    }
                }

                if (restaurantRes.ok) {
                    const restaurantData = await restaurantRes.json();
                    setRestaurant(restaurantData.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId && restaurantId) {
            fetchData();
        }
    }, [orderId, restaurantId, router]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Placed':
                return <Clock className="h-6 w-6 text-blue-500" />;
            case 'Preparing':
                return <ChefHat className="h-6 w-6 text-orange-500" />;
            case 'Ready':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'Delivered':
                return <Truck className="h-6 w-6 text-purple-500" />;
            default:
                return <Clock className="h-6 w-6 text-muted-foreground" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Placed':
                return 'bg-blue-500';
            case 'Preparing':
                return 'bg-orange-500';
            case 'Ready':
                return 'bg-green-500';
            case 'Delivered':
                return 'bg-purple-500';
            default:
                return 'bg-muted';
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'Placed':
                return 'Your order has been received and is being processed.';
            case 'Preparing':
                return 'Our chefs are preparing your delicious meal.';
            case 'Ready':
                return 'Your order is ready! Our staff will bring it to your table.';
            case 'Delivered':
                return 'Enjoy your meal! Thank you for dining with us.';
            default:
                return 'Order status unknown.';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading order...</p>
                </div>
            </div>
        );
    }

    if (!order || !restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Order not found</h2>
                    <p className="text-muted-foreground">Please check your order details and try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container-responsive py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/customer/menu/${restaurantId}/${order.tableNumber}`)}
                                className="hover:bg-muted"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <Logo />
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-lg">{restaurant.name}</h1>
                                <p className="text-sm text-muted-foreground">Order #{order.id.slice(-6)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container-responsive py-6 sm:py-8 md:py-12">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Order Status */}
                    <Card className="card-modern">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                {getStatusIcon(order.status)}
                            </div>
                            <CardTitle className="text-2xl">
                                Order {order.status}
                            </CardTitle>
                            <CardDescription className="text-base">
                                {getStatusDescription(order.status)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Badge className={`${getStatusColor(order.status)} text-white px-4 py-2 text-sm font-semibold`}>
                                {order.status}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Order Details */}
                    <Card className="card-modern">
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                            <CardDescription>
                                Table {order.tableNumber} • {new Date(order.timestamp).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            ₹{item.price.toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}

                            <Separator />

                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span>₹{order.total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card className="card-modern">
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{order.customer.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium">{order.customer.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium">{order.customer.phone}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button
                            onClick={() => router.push(`/customer/menu/${restaurantId}/${order.tableNumber}`)}
                            variant="outline"
                            className="flex-1 h-12"
                        >
                            Order More
                        </Button>
                        <Button
                            onClick={() => router.push('/')}
                            className="flex-1 h-12"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
