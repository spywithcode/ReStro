"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';
import { MinusCircle, PlusCircle, ShoppingCart, User, Search, X } from 'lucide-react';
import Image from 'next/image';

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isAvailable: boolean;
};

type CartItem = {
    menuItem: MenuItem;
    quantity: number;
};

type CustomerInfo = {
    name: string;
    email: string;
    phone: string;
};

export default function CustomerMenuPage() {
    const { restaurantId, tableId } = useParams<{ restaurantId: string, tableId: string }>();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<any>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if customer is logged in
        const storedCustomerInfo = localStorage.getItem('customerInfo');
        if (storedCustomerInfo) {
            setCustomerInfo(JSON.parse(storedCustomerInfo));
        } else {
            // Redirect to login if not logged in
            router.push(`/customer/login/${restaurantId}/${tableId}`);
            return;
        }

        // Fetch restaurant and menu data
        const fetchData = async () => {
            try {
                const [restaurantRes, menuRes] = await Promise.all([
                    fetch(`/api/restaurants?id=${restaurantId}`),
                    fetch(`/api/menu?restaurantId=${restaurantId}`)
                ]);

                if (restaurantRes.ok) {
                    const data = await restaurantRes.json();
                    setRestaurant(data.data[0]);
                }

                if (menuRes.ok) {
                    const data = await menuRes.json();
                    setMenuItems(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (restaurantId) {
            fetchData();
        }
    }, [restaurantId, tableId, router]);

    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.menuItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.menuItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, { menuItem: item, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.menuItem.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(cartItem =>
                    cartItem.menuItem.id === itemId
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
            return prevCart.filter(cartItem => cartItem.menuItem.id !== itemId);
        });
    };

    const getCartItemQuantity = (itemId: string) => {
        return cart.find(cartItem => cartItem.menuItem.id === itemId)?.quantity || 0;
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handlePlaceOrder = async () => {
        if (cart.length === 0 || !customerInfo || !restaurant) return;

        try {
            const orderData = {
                tableNumber: parseInt(tableId as string),
                customer: customerInfo,
                items: cart.map(item => ({
                    menuItemId: item.menuItem.id,
                    quantity: item.quantity,
                    name: item.menuItem.name,
                    price: item.menuItem.price,
                })),
                restaurantId,
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }

            const data = await response.json();
            const orderId = data.data.id;

            // Clear cart and redirect to order page
            setCart([]);
            router.push(`/customer/order/${restaurantId}/${orderId}`);
        } catch (error: any) {
            console.error('Order placement error:', error);
            alert(`Failed to place order: ${error.message}`);
        }
    };

    // Filter menu items
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory && item.isAvailable;
    });

    const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading menu...</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">Restaurant not found</h2>
                    <p className="text-muted-foreground">Please check your QR code and try again.</p>
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
                            <Logo />
                            <div className="hidden sm:block">
                                <h1 className="font-bold text-lg">{restaurant.name}</h1>
                                <p className="text-sm text-muted-foreground">Table {tableId}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 text-sm">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{customerInfo?.name}</span>
                            </div>

                            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="relative">
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Cart</span>
                                        {cartItemCount > 0 && (
                                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                                {cartItemCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-full sm:max-w-lg">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <ShoppingCart className="h-5 w-5" />
                                            Your Order ({cartItemCount} items)
                                        </SheetTitle>
                                        <SheetDescription>
                                            Review your items before placing the order
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="flex-1 py-6">
                                        {cart.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    Add some delicious items from our menu!
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {cart.map(item => (
                                                    <div key={item.menuItem.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                            <Image
                                                                src={item.menuItem.imageUrl}
                                                                alt={item.menuItem.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm sm:text-base truncate">
                                                                {item.menuItem.name}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                ₹{item.menuItem.price.toFixed(2)} each
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => removeFromCart(item.menuItem.id)}
                                                                className="h-8 w-8"
                                                            >
                                                                <MinusCircle className="h-4 w-4" />
                                                            </Button>
                                                            <span className="font-semibold w-8 text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() => addToCart(item.menuItem)}
                                                                className="h-8 w-8"
                                                            >
                                                                <PlusCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {cart.length > 0 && (
                                        <>
                                            <Separator />
                                            <div className="py-4 space-y-2">
                                                <div className="flex justify-between text-lg font-semibold">
                                                    <span>Total</span>
                                                    <span>₹{cartTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <SheetFooter>
                                                <Button
                                                    className="btn-primary w-full h-12 text-base font-semibold"
                                                    onClick={handlePlaceOrder}
                                                >
                                                    Place Order
                                                </Button>
                                            </SheetFooter>
                                        </>
                                    )}
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container-responsive py-6 sm:py-8 md:py-12">
                {/* Search and Filters */}
                <div className="mb-6 sm:mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-modern pl-10 h-12"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                            <Button
                                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory('all')}
                                className="whitespace-nowrap"
                            >
                                All
                            </Button>
                            {categories.map(category => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(category)}
                                    className="whitespace-nowrap"
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-8 sm:space-y-12">
                    {categories.map(category => {
                        const categoryItems = filteredItems.filter(item => item.category === category);
                        if (categoryItems.length === 0) return null;

                        return (
                            <section key={category}>
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="heading-responsive">{category}s</h2>
                                    <Badge variant="secondary" className="text-sm">
                                        {categoryItems.length} items
                                    </Badge>
                                </div>

                                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {categoryItems.map(item => (
                                        <Card key={item.id} className="card-modern group overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="relative aspect-[4/3] overflow-hidden">
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute top-3 right-3">
                                                        <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
                                                            ₹{item.price.toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                                                <CardDescription className="line-clamp-2 text-sm">
                                                    {item.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardFooter className="pt-0">
                                                {getCartItemQuantity(item.id) === 0 ? (
                                                    <Button
                                                        onClick={() => addToCart(item)}
                                                        className="btn-primary w-full h-10"
                                                    >
                                                        Add to Cart
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center gap-2 w-full">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="h-10 w-10 flex-shrink-0"
                                                        >
                                                            <MinusCircle className="h-4 w-4" />
                                                        </Button>
                                                        <div className="flex-1 text-center">
                                                            <span className="font-semibold text-lg">
                                                                {getCartItemQuantity(item.id)}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={() => addToCart(item)}
                                                            className="h-10 w-10 flex-shrink-0"
                                                        >
                                                            <PlusCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No items found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search or filter criteria.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
