
"use client";

import { Table as TableType, TableStatus, Restaurant } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { QrCode, Users, Square, CheckSquare, XSquare, MoreVertical, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAppData } from "@/context/app-context";
import { motion } from "framer-motion";
import AddTableDialog from "@/components/admin/add-table-dialog";


const StatusIcon = ({ status }: { status: TableStatus }) => {
    switch (status) {
        case 'Occupied':
            return <CheckSquare className="h-4 w-4 text-green-500" />;
        case 'Requires-Cleaning':
            return <XSquare className="h-4 w-4 text-yellow-500" />;
        case 'Free':
        default:
            return <Square className="h-4 w-4 text-muted-foreground" />;
    }
};

const TableCard = ({ table, restaurant, onUpdateStatus }: { table: TableType, restaurant: Restaurant, onUpdateStatus: (id: number, status: TableStatus) => void; }) => {
    const getStatusColor = (status: TableStatus) => {
        switch (status) {
            case 'Occupied':
                return 'bg-red-500 text-white';
            case 'Requires-Cleaning':
                return 'bg-yellow-500 text-black';
            case 'Free':
            default:
                return 'bg-green-500 text-white';
        }
    };

    return (
        <Card className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-lg border border-white/10 shadow-lg rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 flex flex-col relative">
            <Badge className={`absolute top-4 right-4 rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(table.status)}`}>
                {table.status.replace('-', ' ')}
            </Badge>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                            {table.id}
                        </span>
                    </div>
                    Table {table.id}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-2 text-muted-foreground">
                    <Users className="h-4 w-4" /> Seats: {table.capacity}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-center justify-center py-6">
               <StatusIcon status={table.status} />
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                 <Button asChild className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium hover:scale-105 transition-all duration-200">
                    <Link href={`/menu/${restaurant.id}/${table.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Menu
                    </Link>
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full bg-background border border-input hover:bg-accent rounded-xl font-medium hover:scale-105 transition-all duration-200">
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border border-border">
                        <DialogHeader>
                            <DialogTitle className="text-foreground">QR Code for Table {table.id}</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Customers can scan this code to view the menu and place an order.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center p-4">
                            <Image src={table.qrCodeUrl} alt={`QR Code for Table ${table.id}`} width={256} height={256} className="rounded-xl border border-border" />
                        </div>
                    </DialogContent>
                </Dialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-lg">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border border-border">
                        <DropdownMenuLabel className="text-foreground">Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onUpdateStatus(table.id, 'Free')}
                            className="hover:bg-accent"
                        >
                            Free
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onUpdateStatus(table.id, 'Occupied')}
                            className="hover:bg-accent"
                        >
                            Occupied
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onUpdateStatus(table.id, 'Requires-Cleaning')}
                            className="hover:bg-accent"
                        >
                            Requires Cleaning
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
};

export default function TablesPage() {
    const { tables, restaurant, updateTableStatus } = useAppData();

    if (!restaurant) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔄</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Loading...</h3>
                    <p className="text-muted-foreground text-sm">Please wait while we load your tables.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Table Management</h1>
                    <p className="text-muted-foreground">Monitor table statuses and access QR codes.</p>
                </div>
                <AddTableDialog />
            </div>
            <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tables.map((table, index) => (
                    <motion.div
                        key={table.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <TableCard table={table} restaurant={restaurant} onUpdateStatus={updateTableStatus} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
