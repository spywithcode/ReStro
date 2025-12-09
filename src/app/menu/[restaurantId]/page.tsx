"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/logo';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAppData, AppProvider } from '@/context/app-context';

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isAvailable: boolean;
};

function ManagerMenuPageContent() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const { restaurant, menuItems, isLoading, setRestaurantId } = useAppData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        if (restaurantId) {
            setRestaurantId(restaurantId as string);
        }
    }, [restaurantId, setRestaurantId]);

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
                    <p className="text-muted-foreground">Please check the restaurant ID and try again.</p>
                </div>
            </div>
        );
    }

    // Filter menu items
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory && item.isAvailable;
    });

    const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];

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
                                <p className="text-sm text-muted-foreground">Menu Overview</p>
                            </div>
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

export default function ManagerMenuPage() {
    return (
        <AppProvider>
            <ManagerMenuPageContent />
        </AppProvider>
    )
}
