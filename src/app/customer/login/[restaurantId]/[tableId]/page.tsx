"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { User, Mail, Phone, QrCode } from 'lucide-react';

type CustomerInfo = {
    name: string;
    email: string;
    phone: string;
};

export default function CustomerLoginPage() {
    const { restaurantId, tableId } = useParams<{ restaurantId: string, tableId: string }>();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        email: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if already logged in
        const storedCustomerInfo = localStorage.getItem('customerInfo');
        if (storedCustomerInfo) {
            // Already logged in, redirect to menu
            router.push(`/customer/menu/${restaurantId}/${tableId}`);
            return;
        }

        // Fetch restaurant data
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(`/api/restaurants?id=${restaurantId}`);
                if (response.ok) {
                    const data = await response.json();
                    setRestaurant(data.data[0]);
                }
            } catch (error) {
                console.error('Failed to fetch restaurant:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (restaurantId) {
            fetchRestaurant();
        }
    }, [restaurantId, tableId, router]);

    const handleInputChange = (field: keyof CustomerInfo, value: string) => {
        setCustomerInfo(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            alert('Please fill in all fields');
            return;
        }

        // Store customer info in localStorage
        localStorage.setItem('customerInfo', JSON.stringify(customerInfo));

        // Redirect to menu
        router.push(`/customer/menu/${restaurantId}/${tableId}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Restaurant not found</h2>
                    <p className="text-muted-foreground">Please check your QR code and try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-md card-modern">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <Logo />
                    </div>
                    <CardTitle className="heading-responsive text-center">
                        Welcome to {restaurant.name}
                    </CardTitle>
                    <CardDescription className="text-center text-responsive">
                        Table {tableId} • Please enter your details to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Your Name
                            </Label>
                            <Input
                                id="name"
                                value={customerInfo.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your name"
                                required
                                className="input-modern h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={customerInfo.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email address"
                                required
                                className="input-modern h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone Number
                            </Label>
                            <Input
                                id="phone"
                                value={customerInfo.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Enter your phone number"
                                required
                                className="input-modern h-12"
                            />
                        </div>
                        <Button type="submit" className="btn-primary w-full h-12 text-base font-semibold">
                            Continue to Menu
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
