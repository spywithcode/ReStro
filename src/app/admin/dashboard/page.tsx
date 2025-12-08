"use client";

import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Users, Utensils, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppData } from '@/context/app-context';
import { OrderStatus } from '@/lib/data';

export default function DashboardPage() {
  const { orders, menuItems, tables } = useAppData();

  const todayRevenue = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const occupiedTables = tables.filter(t => t.status === 'Occupied').length;
  const totalTables = tables.length;

  const stats = [
    {
      title: 'Todays Revenue',
      value: `₹${todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: '+12%',
      changeType: 'increase' as const,
      description: 'compared to yesterday'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      change: '+8%',
      changeType: 'increase' as const,
      description: 'compared to yesterday'
    },
    {
      title: 'Occupied Tables',
      value: `${occupiedTables}/${totalTables}`,
      icon: Users,
      change: '-2',
      changeType: 'decrease' as const,
      description: 'compared to yesterday'
    },
    {
      title: 'Menu Items',
      value: menuItems.length.toString(),
      icon: Utensils,
      change: '1 new',
      changeType: 'increase' as const,
      description: 'this week'
    },
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing':
        return 'bg-warning text-warning-foreground';
      case 'Ready':
        return 'bg-primary text-primary-foreground';
      case 'Completed':
        return 'bg-success text-success-foreground';
      case 'Placed':
      default:
        return 'bg-destructive text-destructive-foreground';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Here's a snapshot of your restaurant's performance today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2 text-xs">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={cn(
                    "font-medium",
                    stat.changeType === 'increase' ? 'text-success' : 'text-destructive'
                  )}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-2xl shadow-lg">
        <div className="p-4 sm:p-6 border-b border-border">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Recent Orders</h2>
          <p className="text-muted-foreground text-sm">Latest customer orders and their status</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Table</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell">Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {order.tableNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-sm text-foreground">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {order.customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <span key={idx} className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-lg">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded-lg">
                            +{order.items.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={cn("text-xs", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 font-semibold text-foreground">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">
                      {order.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">No orders yet</h3>
              <p className="text-muted-foreground text-sm">
                Orders will appear here once customers start placing them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
