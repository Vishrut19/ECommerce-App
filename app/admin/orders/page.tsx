'use client';

import { useQuery } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Search, Eye } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

// Order types
interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    attributes?: Record<string, string>;
}

interface Order {
    id: string;
    userId?: string;
    total: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

// Hooks for orders
function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            try {
                return await apiClient<Order[]>('/api/orders');
            } catch {
                // Return mock data if API doesn't exist yet
                return getMockOrders();
            }
        },
    });
}

// Mock orders for demonstration
function getMockOrders(): Order[] {
    return [
        {
            id: 'ORD-001',
            userId: 'user-1',
            total: 1299.99,
            currency: 'USD',
            status: 'completed',
            items: [
                { id: '1', productId: 'iphone-13-pro', productName: 'iPhone 13 Pro', quantity: 1, price: 1299.99 },
            ],
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
            id: 'ORD-002',
            userId: 'user-2',
            total: 499.99,
            currency: 'USD',
            status: 'processing',
            items: [
                { id: '2', productId: 'playstation-5', productName: 'PlayStation 5', quantity: 1, price: 499.99 },
            ],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: 'ORD-003',
            userId: 'user-3',
            total: 234.50,
            currency: 'USD',
            status: 'pending',
            items: [
                { id: '3', productId: 'nike-hoodie', productName: 'Nike Hoodie', quantity: 2, price: 117.25 },
            ],
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: 'ORD-004',
            userId: 'user-4',
            total: 89.99,
            currency: 'USD',
            status: 'cancelled',
            items: [
                { id: '4', productId: 'basic-tee', productName: 'Basic T-Shirt', quantity: 3, price: 29.99 },
            ],
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
            id: 'ORD-005',
            userId: 'user-5',
            total: 2499.99,
            currency: 'USD',
            status: 'completed',
            items: [
                { id: '5', productId: 'macbook-pro', productName: 'MacBook Pro', quantity: 1, price: 2499.99 },
            ],
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
    ];
}

const statusColors: Record<Order['status'], string> = {
    pending: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
    processing: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    completed: 'text-green-500 border-green-500/20 bg-green-500/5',
    cancelled: 'text-destructive border-destructive/20 bg-destructive/5',
};

// Order details dialog
function OrderDetailsDialog({ order }: { order: Order }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-none border-border/40 hover:bg-primary hover:text-primary-foreground transition-all">
                    <Eye className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-none border-border/40 bg-background p-12 max-w-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                
                <DialogHeader className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Transaction Report</span>
                    </div>
                    <DialogTitle className="text-3xl font-bold tracking-tighter uppercase">Manifest {order.id}</DialogTitle>
                </DialogHeader>

                <div className="space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Status</p>
                            <Badge variant="outline" className={cn("rounded-none text-[9px] uppercase tracking-widest font-bold py-0 h-5", statusColors[order.status])}>
                                {order.status}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Timestamp</p>
                            <p className="text-xs font-bold uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total Value</p>
                            <p className="text-xs font-bold uppercase tracking-tight tabular-nums">${order.total.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Currency</p>
                            <p className="text-xs font-bold uppercase tracking-tight">{order.currency}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary border-b border-border/10 pb-2">Allocated Units</h4>
                        <div className="space-y-2">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-4 border border-border/40 bg-muted/20 group hover:bg-muted/30 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-widest">{item.productName}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="text-xs font-bold tabular-nums tracking-tighter">${item.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border/10 flex justify-end">
                        <Button className="rounded-none h-12 px-8 uppercase tracking-widest text-[10px] font-bold">
                            Print Manifest
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function OrdersPage() {
    const { data: orders = [], isLoading } = useOrders();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'id',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Manifest ID</span>,
            cell: ({ row }) => (
                <span className="font-bold tracking-tight uppercase text-xs">{row.getValue('id')}</span>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="p-0 text-[10px] uppercase tracking-widest font-bold hover:bg-transparent"
                >
                    Timestamp
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{new Date(row.getValue('createdAt')).toLocaleDateString()}</span>
            ),
        },
        {
            accessorKey: 'items',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Units</span>,
            cell: ({ row }) => {
                const items = row.getValue('items') as OrderItem[];
                return <span className="text-[10px] uppercase tracking-widest font-bold">{items.length} Units</span>;
            },
        },
        {
            accessorKey: 'total',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="p-0 text-[10px] uppercase tracking-widest font-bold hover:bg-transparent"
                >
                    Valuation
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const total = parseFloat(row.getValue('total'));
                return <span className="text-xs font-bold tracking-tighter tabular-nums">${total.toFixed(2)}</span>;
            },
        },
        {
            accessorKey: 'status',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Process Status</span>,
            cell: ({ row }) => {
                const status = row.getValue('status') as Order['status'];
                return (
                    <Badge variant="outline" className={cn("rounded-none text-[9px] uppercase tracking-widest font-bold py-0 h-5", statusColors[status])}>
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Inspect</span>,
            cell: ({ row }) => <OrderDetailsDialog order={row.original} />,
        },
    ];

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter);

    const table = useReactTable({
        data: filteredOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
        },
    });

    // Calculate stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        revenue: orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + o.total, 0),
    };

    const statCards = [
        { label: 'Total Manifests', value: stats.total, color: 'muted' },
        { label: 'Pending Processing', value: stats.pending, color: 'yellow' },
        { label: 'Active Fulfillment', value: stats.processing, color: 'blue' },
        { label: 'Purged / Cancelled', value: stats.cancelled, color: 'destructive' },
        { label: 'Fulfillment Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'green' },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">Syncing Fulfillment Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tighter uppercase">Fulfillment Engine</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium max-w-2xl">
                    Monitor global transactions, track logistics lifecycles, and analyze revenue flow.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="border border-border/40 bg-muted/20 p-6 space-y-2">
                        <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</span>
                        <p className={cn(
                            "text-xl font-bold tracking-tighter tabular-nums",
                            stat.color === 'yellow' ? "text-yellow-500" :
                            stat.color === 'blue' ? "text-blue-500" :
                            stat.color === 'green' ? "text-green-500" :
                            stat.color === 'destructive' ? "text-destructive" : ""
                        )}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                {/* Filters Terminal */}
                <div className="border border-border/40 bg-muted/20 p-6 flex flex-wrap gap-4 items-center">
                    <div className="relative group flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="SEARCH BY MANIFEST ID..."
                            value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
                            onChange={(event) =>
                                table.getColumn('id')?.setFilterValue(event.target.value)
                            }
                            className="h-12 pl-12 rounded-none border-border/40 bg-background/50 text-[10px] uppercase tracking-widest font-bold focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px] h-12 rounded-none border-border/40 bg-background/50 text-[10px] uppercase tracking-widest font-bold">
                            <SelectValue placeholder="PROCESS STATUS" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border/40">
                            <SelectItem value="all" className="text-[10px] uppercase tracking-widest font-bold">ALL STATUS</SelectItem>
                            <SelectItem value="pending" className="text-[10px] uppercase tracking-widest font-bold">PENDING</SelectItem>
                            <SelectItem value="processing" className="text-[10px] uppercase tracking-widest font-bold">PROCESSING</SelectItem>
                            <SelectItem value="completed" className="text-[10px] uppercase tracking-widest font-bold">COMPLETED</SelectItem>
                            <SelectItem value="cancelled" className="text-[10px] uppercase tracking-widest font-bold">CANCELLED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table Terminal */}
                <div className="border border-border/40 bg-background overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="h-14 border-r border-border/10 last:border-0">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="border-border/40 hover:bg-muted/20 transition-colors group"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="h-16 border-r border-border/10 last:border-0 py-0">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-32 text-center text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground"
                                    >
                                        No manifests matched the current query.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Terminal */}
                <div className="flex items-center justify-between py-6 border-t border-border/10">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Syncing <span className="text-foreground">{table.getRowModel().rows.length}</span> of <span className="text-foreground">{filteredOrders.length}</span> Active Manifests
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="rounded-none h-10 px-4 uppercase tracking-widest text-[10px] font-bold border-border/40"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="rounded-none h-10 px-4 uppercase tracking-widest text-[10px] font-bold border-border/40"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
