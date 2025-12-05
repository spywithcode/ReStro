"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useAppData } from "@/context/app-context";

export default function AddTableDialog() {
    const { addTable } = useAppData();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        capacity: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const tableId = parseInt(formData.id);
            const capacity = parseInt(formData.capacity);

            if (isNaN(tableId) || tableId < 1) {
                throw new Error('Table ID must be a positive number');
            }

            if (isNaN(capacity) || capacity < 1 || capacity > 20) {
                throw new Error('Capacity must be between 1 and 20');
            }

            await addTable({ id: tableId, capacity });

            // Reset form and close dialog
            setFormData({ id: '', capacity: '' });
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding table:', error);
            // Error is handled in the context with toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Table
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Table</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Create a new table for your restaurant. The QR code will be generated automatically.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="id" className="text-foreground">Table Number</Label>
                        <Input
                            id="id"
                            name="id"
                            type="number"
                            min="1"
                            value={formData.id}
                            onChange={handleInputChange}
                            placeholder="e.g., 1"
                            className="bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring transition-all duration-200"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="capacity" className="text-foreground">Capacity</Label>
                        <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.capacity}
                            onChange={handleInputChange}
                            placeholder="e.g., 4"
                            className="bg-background border border-input rounded-xl focus:ring-2 focus:ring-ring transition-all duration-200"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="bg-background border border-input hover:bg-accent rounded-xl font-medium transition-all duration-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? "Adding..." : "Add Table"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
