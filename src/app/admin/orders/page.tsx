
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Order, OrderStatus } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { useAppData } from "@/context/app-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const orderStatuses: OrderStatus[] = ['Placed', 'Preparing', 'Ready', 'Completed'];

const OrderCard = ({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: string, status: OrderStatus) => void; }) => {

    const getNextStatus = (): OrderStatus | null => {
        const currentIndex = orderStatuses.indexOf(order.status);
        if (currentIndex >= 0 && currentIndex < orderStatuses.length - 1) {
            return orderStatuses[currentIndex + 1];
        }
        return null;
    }

    const nextStatus = getNextStatus();

    const isPaymentStep = order.status === 'Ready' && nextStatus === 'Completed';

    const handleUpdate = () => {
        if (nextStatus) {
            onUpdateStatus(order.id, nextStatus);
        }
    }

    return (
        <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                    {order.tableNumber}
                                </span>
                            </div>
                            Table {order.tableNumber}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">{order.id}</CardDescription>
                    </div>
                     <div className="text-right">
                        <p className="font-semibold text-sm text-foreground">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{order.timestamp.toLocaleTimeString()}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <ul className="space-y-2">
                    {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.quantity}x {item.name}</span>
                        </li>
                    ))}
                </ul>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>₹{order.total.toFixed(2)}</span>
                </div>
            </CardContent>
            {nextStatus && (
                <CardFooter>
                     {isPaymentStep ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                                    Mark as {nextStatus}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">Confirm Payment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Confirm that payment of ₹{order.total.toFixed(2)} has been received for this order.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                     <RadioGroup defaultValue="Cash">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Cash" id="cash" />
                                            <Label htmlFor="cash" className="text-foreground">Cash / Offline</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Online" id="online" />
                                            <Label htmlFor="online" className="text-foreground">Online</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleUpdate}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        Confirm & Complete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                         <Button
                             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                             onClick={handleUpdate}
                         >
                            Mark as {nextStatus}
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

export default function OrdersPage() {
    const { orders, updateOrderStatus } = useAppData();

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Order Management</h1>
                    <p className="text-muted-foreground">Track and manage all customer orders in real-time.</p>
                </div>
            </div>
            <Tabs defaultValue="Placed" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted p-1 rounded-xl">
                    {orderStatuses.map(status => (
                        <TabsTrigger
                            key={status}
                            value={status}
                            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                        >
                            {status} ({orders.filter(o => o.status === status).length})
                        </TabsTrigger>
                    ))}
                </TabsList>
                {orderStatuses.map(status => (
                    <TabsContent key={status} value={status} className="mt-6">
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {orders.filter(o => o.status === status).length > 0 ? (
                                orders.filter(o => o.status === status)
                                    .sort((a,b) => a.timestamp.getTime() - b.timestamp.getTime())
                                    .map(order => (
                                    <OrderCard key={order.id} order={order} onUpdateStatus={updateOrderStatus} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📋</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-foreground">No {status.toLowerCase()} orders</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Orders in this status will appear here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
