"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, MoreHorizontal, Trash2, Pencil, Search, Filter } from "lucide-react";
import Image from "next/image";
import AiSuggestion from "@/components/admin/ai-suggestion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAppData } from '@/context/app-context';
import { MenuItem } from '@/lib/data';
import { MenuItemDialog } from '@/components/admin/menu-item-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export default function MenuPage() {
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useAppData();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

    const handleSave = (item: Omit<MenuItem, 'id'>) => {
        if (editingItem) {
            updateMenuItem({ ...item, id: editingItem.id });
        } else {
            addMenuItem(item);
        }
        setEditingItem(undefined);
        setIsDialogOpen(false);
    };

    const handleAddNew = () => {
        setEditingItem(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    // Filter menu items based on search and filters
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesAvailability = availabilityFilter === 'all' ||
                                   (availabilityFilter === 'available' && item.isAvailable) ||
                                   (availabilityFilter === 'unavailable' && !item.isAvailable);

        return matchesSearch && matchesCategory && matchesAvailability;
    });

    const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage'];

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Menu Management</h1>
                    <p className="text-muted-foreground">Add, edit, and organize your menu items with AI-powered suggestions.</p>
                </div>
                <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Item
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filters and Search */}
                    <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
                        <CardContent className="p-0">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search menu items..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm sm:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-full sm:w-48 bg-background border border-input rounded-xl hover:bg-accent transition-colors">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                                    <SelectTrigger className="w-full sm:w-32 bg-background border border-input rounded-xl hover:bg-accent transition-colors">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="unavailable">Unavailable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Menu Items Table */}
                    <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl text-foreground">Menu Items ({filteredItems.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card">
                                        <TableRow className="border-b border-border hover:bg-transparent">
                                            <TableHead className="w-16 text-muted-foreground">Image</TableHead>
                                            <TableHead className="text-muted-foreground">Name</TableHead>
                                            <TableHead className="hidden sm:table-cell text-muted-foreground">Category</TableHead>
                                            <TableHead className="hidden md:table-cell text-muted-foreground">Description</TableHead>
                                            <TableHead className="text-muted-foreground">Price</TableHead>
                                            <TableHead className="text-muted-foreground">Status</TableHead>
                                            <TableHead className="w-12 text-muted-foreground">
                                                <span className="sr-only">Actions</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.map((item) => (
                                            <TableRow key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                                <TableCell>
                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted">
                                                        <Image
                                                            alt={item.name}
                                                            src={item.imageUrl}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm sm:text-base text-foreground">{item.name}</p>
                                                        <p className="text-xs text-muted-foreground sm:hidden">{item.category}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge variant="outline" className="text-xs bg-muted/50">
                                                        {item.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="font-semibold text-foreground">
                                                    ₹{item.price.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={cn(
                                                            "text-xs",
                                                            item.isAvailable
                                                                ? "bg-success text-success-foreground"
                                                                : "bg-destructive text-destructive-foreground"
                                                        )}
                                                    >
                                                        {item.isAvailable ? "Available" : "Unavailable"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted rounded-lg">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-card border border-border">
                                                            <DropdownMenuLabel className="text-foreground">Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEdit(item)} className="hover:bg-accent">
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                             <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive hover:bg-destructive/10">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent className="bg-card border border-border">
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle className="text-foreground">Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete the menu item "{item.name}".
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel className="bg-muted hover:bg-muted/80">Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => deleteMenuItem(item.id)}
                                                                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {filteredItems.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <PlusCircle className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-foreground">No menu items found</h3>
                                    <p className="text-muted-foreground text-sm mb-6">
                                        {searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all'
                                            ? 'Try adjusting your filters or search terms.'
                                            : 'Get started by adding your first menu item.'
                                        }
                                    </p>
                                    <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-3 font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Menu Item
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* AI Suggestions Sidebar */}
                <div className="lg:col-span-1">
                    <AiSuggestion />
                </div>
            </div>

            <MenuItemDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
                item={editingItem}
            />
        </div>
    );
}
