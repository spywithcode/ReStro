
"use client";

import { useAppData, AppProvider } from '@/context/app-context';
import { OrderStatus } from '@/lib/data';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChefHat, CookingPot, Loader, Salad, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

const statusInfo = {
    'Placed': { icon: Salad, text: 'Your order has been placed.', description: 'The kitchen is about to start preparing your meal.' },
    'Preparing': { icon: CookingPot, text: 'Your order is being prepared.', description: 'Our chefs are working their magic. Good food takes time!' },
    'Ready': { icon: ChefHat, text: 'Your order is ready!', description: 'Our staff will be bringing your food to your table shortly.' },
    'Completed': { icon: CheckCircle, text: 'Order completed.', description: 'We hope you enjoyed your meal!' },
};

function OrderStatusPageContent() {
    const { restaurantId, orderId } = useParams<{ restaurantId: string, orderId: string }>();
    const { getOrderById, restaurant, isLoading, setRestaurantId } = useAppData();
    const router = useRouter();
    const [order, setOrder] = useState(() => getOrderById(orderId));

     useEffect(() => {
        if (restaurantId) {
            setRestaurantId(restaurantId as string);
        }
    }, [restaurantId, setRestaurantId]);

    useEffect(() => {
        // Function to update the order state
        const updateOrderState = () => {
            const updatedOrder = getOrderById(orderId);
            setOrder(updatedOrder);
        };
        
        // Initial load
        updateOrderState();

        // Listen for storage changes from other tabs
        window.addEventListener('storage', updateOrderState);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('storage', updateOrderState);
        };
    }, [orderId, getOrderById]);


    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    if (!order || !restaurant) {
        return <div className="flex h-screen w-full items-center justify-center">Order not found.</div>;
    }

    const currentStatusInfo = statusInfo[order.status];
    const statusIndex = (Object.keys(statusInfo) as OrderStatus[]).indexOf(order.status);


    return (
        <div className="flex flex-col min-h-screen bg-muted/40">
            <header className="bg-background p-4 shadow-sm print:hidden">
                <Logo />
            </header>
            <main className="flex-1 flex items-center justify-center p-4 print:p-0 print:m-0 print:bg-white print:block">
                 <Card className="w-full max-w-lg shadow-xl print:shadow-none print:border-none">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Thank You for Your Order!</CardTitle>
                        <CardDescription>Order ID: {order.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="print:hidden">
                             <div className="flex justify-between items-center mb-2">
                                {(Object.keys(statusInfo) as OrderStatus[]).map((status, index) => {
                                    const Icon = statusInfo[status].icon;
                                    return (
                                        <div key={status} className={cn("flex flex-col items-center gap-1", statusIndex >= index ? 'text-primary' : 'text-muted-foreground')}>
                                           <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", statusIndex >= index ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs text-center">{status}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="relative w-full h-1 bg-muted rounded-full">
                                <div className="absolute top-0 left-0 h-1 bg-primary rounded-full transition-all duration-500" style={{width: `${(statusIndex / 3) * 100}%`}}></div>
                            </div>
                        </div>

                        <div className="text-center bg-primary/10 p-4 rounded-lg print:hidden">
                            <h3 className="font-semibold text-lg">{currentStatusInfo.text}</h3>
                            <p className="text-muted-foreground">{currentStatusInfo.description}</p>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold mb-2">Order Summary</h3>
                            <ul className="space-y-2">
                                {order.items.map((item, index) => (
                                    <li key={index} className="flex justify-between">
                                        <span>{item.quantity}x {item.name}</span>
                                         <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <Separator className="my-3" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{order.total.toFixed(2)}</span>
                            </div>
                        </div>
                         <div className="text-center pt-4 text-sm text-muted-foreground print:block hidden">
                            <p>Thank you for dining at {restaurant.name}!</p>
                            <p>Date: {new Date(order.timestamp).toLocaleString()}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="print:hidden">
                         {order.status === 'Completed' ? (
                            <Button className="w-full" onClick={() => window.print()}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Print Receipt
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full" onClick={() => router.push(`/menu/${restaurantId}/${order.tableNumber}`)}>
                                Order More
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}


export default function OrderStatusPage() {
    return (
        <AppProvider>
            <OrderStatusPageContent />
        </AppProvider>
    )
}
