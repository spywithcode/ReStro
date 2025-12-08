
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MenuItem } from '@/lib/data';

interface MenuItemDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (item: Omit<MenuItem, 'id'>) => void;
    item?: MenuItem;
}

const defaultItem: Omit<MenuItem, 'id'> = {
    name: '',
    description: '',
    price: 0,
    category: 'Main Course',
    imageUrl: '/images/default-food.jpg',
    isAvailable: true,
    restaurantId: '',
};

export function MenuItemDialog({ isOpen, onOpenChange, onSave, item }: MenuItemDialogProps) {
    const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>(item || defaultItem);

    useEffect(() => {
        setFormData(item || defaultItem);
    }, [item, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? parseFloat(value) : value
        }));
    };

    const handleCategoryChange = (value: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage') => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleAvailabilityChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, isAvailable: checked }));
    };
    
    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Make changes to your menu item here.' : 'Add a new item to your menu.'} Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Select onValueChange={handleCategoryChange} defaultValue={formData.category}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Appetizer">Appetizer</SelectItem>
                                <SelectItem value="Main Course">Main Course</SelectItem>
                                <SelectItem value="Dessert">Dessert</SelectItem>
                                <SelectItem value="Beverage">Beverage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                        <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isAvailable" className="text-right">Available</Label>
                        <Switch id="isAvailable" checked={formData.isAvailable} onCheckedChange={handleAvailabilityChange} />
                    </div>
                </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleSave}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
}
