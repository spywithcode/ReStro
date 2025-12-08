
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart"
import { reportData } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, DollarSign, ShoppingCart, Utensils } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { addDays, format, isAfter, isBefore, isEqual } from "date-fns"
import { cn } from "@/lib/utils"
import { useAppData } from "@/context/app-context"

const COLORS = {
    'Appetizer': 'hsl(var(--chart-1))',
    'Main Course': 'hsl(var(--chart-2))',
    'Dessert': 'hsl(var(--chart-3))',
    'Beverage': 'hsl(var(--chart-4))',
};

export default function ReportsPage() {
    const { orders, menuItems } = useAppData();
    const [date, setDate] = React.useState<DateRange | undefined>(undefined)

    const filteredOrders = React.useMemo(() => {
        return orders.filter(order => {
            if (!date?.from || !date?.to) return true;
            const orderDate = order.timestamp;
            return (isAfter(orderDate, date.from) || isEqual(orderDate, date.from)) && (isBefore(orderDate, date.to) || isEqual(orderDate, date.to));
        });
    }, [orders, date]);

    const totalRevenue = filteredOrders.filter(o => o.status === 'Completed').reduce((acc, curr) => acc + curr.total, 0);
    const totalOrders = filteredOrders.length;

    const salesByCategory = React.useMemo(() => {
        const categoryMap: { [key: string]: { value: number, count: number } } = {
            'Appetizer': { value: 0, count: 0 },
            'Main Course': { value: 0, count: 0 },
            'Dessert': { value: 0, count: 0 },
            'Beverage': { value: 0, count: 0 }
        };

        let totalSales = 0;

        filteredOrders.filter(o => o.status === 'Completed').forEach(order => {
            order.items.forEach(item => {
                const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                const itemPrice = menuItem ? menuItem.price : item.price;
                const itemCategory = menuItem ? menuItem.category : 'Main Course'; // Default category if not found
                categoryMap[itemCategory].value += itemPrice * item.quantity;
                categoryMap[itemCategory].count += item.quantity;
                totalSales += itemPrice * item.quantity;
            });
        });

        // If no sales data, return empty array to show no data message
        if (totalSales === 0) {
            return [];
        }

        return Object.entries(categoryMap).map(([name, data]) => ({ name, ...data }));
    }, [filteredOrders, menuItems]);


    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Analyze your restaurant&apos;s performance over time.</p>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[300px] justify-start text-left font-normal bg-background border border-input rounded-xl hover:bg-accent transition-colors",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border border-border" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">₹{totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">For the selected period</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">For the selected period</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items</CardTitle>
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">{menuItems.length}</div>
                        <p className="text-xs text-muted-foreground">Total items on menu</p>
                    </CardContent>
                </Card>
            </div>
                  <div className="grid gap-4 md:grid-cols-2">
                     <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                         <CardHeader>
                             <CardTitle className="text-foreground">Revenue Over Time</CardTitle>
                             <CardDescription className="text-muted-foreground">
                                 Showing revenue for the selected period.
                             </CardDescription>
                         </CardHeader>
                         <CardContent>
                             <div style={{ width: "100%", height: 400 }}>
                                 <ChartContainer config={{ revenue: { label: 'Revenue', color: 'hsl(var(--primary))' } }} className="h-full w-full">
                                     <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={reportData}>
                                             <CartesianGrid vertical={false} />
                                             <XAxis
                                                 dataKey="date"
                                                 tickLine={false}
                                                 tickMargin={10}
                                                 axisLine={false}
                                                 tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                             />
                                             <YAxis tickFormatter={(value) => `₹${value}`} />
                                             <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                             <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                         </BarChart>
                                     </ResponsiveContainer>
                                 </ChartContainer>
                             </div>
                         </CardContent>
                     </Card>
                     <Card className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                         <CardHeader>
                             <CardTitle className="text-foreground">Sales by Category</CardTitle>
                             <CardDescription className="text-muted-foreground">
                                 Showing sales distribution across menu categories.
                             </CardDescription>
                         </CardHeader>
                         <CardContent>
                             {salesByCategory.length === 0 ? (
                                 <div className="flex flex-col items-center justify-center h-96 text-center">
                                     <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                                     <h3 className="text-lg font-semibold text-foreground mb-2">No Sales Data</h3>
                                     <p className="text-muted-foreground">No completed orders found for the selected period. Sales data will appear here once orders are completed.</p>
                                 </div>
                             ) : (
                                 <div style={{ width: "100%", height: 400 }}>
                                     <ChartContainer config={{}} className="h-full w-full">
                                         <ResponsiveContainer width="100%" height="90%">
                                             <PieChart>
                                                 <Pie
                                                     data={salesByCategory}
                                                     cx="50%"
                                                     cy="50%"
                                                     labelLine={false}
                                                     label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                     outerRadius={80}
                                                     fill="#8884d8"
                                                     dataKey="value"
                                                 >
                                                     {salesByCategory.map((entry, index) => (
                                                         <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                                                     ))}
                                                 </Pie>
                                                 <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                             </PieChart>
                                         </ResponsiveContainer>
                                     </ChartContainer>
                                 </div>
                             )}
                         </CardContent>
                     </Card>
                  </div>
         </div>
     );
 }
