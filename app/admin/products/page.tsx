'use client';

import { useProducts, useDeleteProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from '@tanstack/react-table';
import { Product } from '@/types';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Edit, Trash2, Plus, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ProductsManagementPage() {
    const { data: products, isLoading } = useProducts();
    const deleteProduct = useDeleteProduct();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="p-0 text-[10px] uppercase tracking-widest font-bold hover:bg-transparent"
                    >
                        Item Name
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="font-bold tracking-tight uppercase text-xs">{row.getValue('name')}</div>
                );
            },
        },
        {
            accessorKey: 'brand',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Brand</span>,
            cell: ({ row }) => <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{row.getValue('brand')}</span>,
        },
        {
            accessorKey: 'category',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Segment</span>,
            cell: ({ row }) => {
                const category = row.getValue('category') as string;
                return (
                    <Badge variant="outline" className="rounded-none border-border/40 text-[9px] uppercase tracking-widest font-bold py-0 h-5">
                        {category}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'inStock',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Status</span>,
            cell: ({ row }) => {
                const inStock = row.getValue('inStock') as boolean;
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full", inStock ? "bg-green-500" : "bg-destructive")} />
                        <span className={cn("text-[10px] uppercase tracking-widest font-bold", inStock ? "text-green-500" : "text-destructive")}>
                            {inStock ? 'Available' : 'Depleted'}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'prices',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="p-0 text-[10px] uppercase tracking-widest font-bold hover:bg-transparent"
                    >
                        Valuation (USD)
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const prices = row.getValue('prices') as Product['prices'];
                const usdPrice = prices.find(p => p.currency.label === 'USD');
                return <div className="text-xs font-bold tracking-tighter tabular-nums">${usdPrice?.amount.toFixed(2)}</div>;
            },
        },
        {
            id: 'actions',
            header: () => <span className="text-[10px] uppercase tracking-widest font-bold">Command</span>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none border-border/40 hover:bg-primary hover:text-primary-foreground transition-all"
                            asChild
                        >
                            <Link href={`/admin/products/edit?id=${product.id}`}>
                                <Edit className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-none border-border/40 hover:bg-destructive hover:text-destructive-foreground transition-all text-muted-foreground hover:text-white"
                            onClick={() => {
                                setProductToDelete(product.id);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: products || [],
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

    const handleDelete = () => {
        if (productToDelete) {
            deleteProduct.mutate(productToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setProductToDelete(null);
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">Syncing Inventory Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tighter uppercase">Inventory Core</h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium max-w-2xl">
                        Manage global SKUs, segment allocation, and real-time inventory levels.
                    </p>
                </div>
                <Button asChild className="rounded-none h-14 px-8 uppercase tracking-[0.2em] text-xs font-bold hover:scale-[1.02] transition-all">
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Initiate New SKU
                    </Link>
                </Button>
            </div>

            <div className="space-y-6">
                {/* Filters Terminal */}
                <div className="border border-border/40 bg-muted/20 p-6 flex flex-wrap gap-4 items-center">
                    <div className="relative group flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="SEARCH BY IDENTIFIER..."
                            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                            onChange={(event) =>
                                table.getColumn('name')?.setFilterValue(event.target.value)
                            }
                            className="h-12 pl-12 rounded-none border-border/40 bg-background/50 text-[10px] uppercase tracking-widest font-bold focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    
                    <Select
                        value={(table.getColumn('category')?.getFilterValue() as string) ?? 'all'}
                        onValueChange={(value) =>
                            table.getColumn('category')?.setFilterValue(value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="w-[200px] h-12 rounded-none border-border/40 bg-background/50 text-[10px] uppercase tracking-widest font-bold">
                            <SelectValue placeholder="SEGMENT" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border/40">
                            <SelectItem value="all" className="text-[10px] uppercase tracking-widest font-bold">ALL SEGMENTS</SelectItem>
                            <SelectItem value="tech" className="text-[10px] uppercase tracking-widest font-bold">TECH CORE</SelectItem>
                            <SelectItem value="clothes" className="text-[10px] uppercase tracking-widest font-bold">FASHION SEGMENT</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={(table.getColumn('inStock')?.getFilterValue() as string) ?? 'all'}
                        onValueChange={(value) =>
                            table.getColumn('inStock')?.setFilterValue(
                                value === 'all' ? '' : value === 'true'
                            )
                        }
                    >
                        <SelectTrigger className="w-[200px] h-12 rounded-none border-border/40 bg-background/50 text-[10px] uppercase tracking-widest font-bold">
                            <SelectValue placeholder="AVAILABILITY" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-border/40">
                            <SelectItem value="all" className="text-[10px] uppercase tracking-widest font-bold">ALL STATUS</SelectItem>
                            <SelectItem value="true" className="text-[10px] uppercase tracking-widest font-bold">AVAILABLE</SelectItem>
                            <SelectItem value="false" className="text-[10px] uppercase tracking-widest font-bold">DEPLETED</SelectItem>
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
                                        data-state={row.getIsSelected() && 'selected'}
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
                                        No SKUs matched the current query.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Terminal */}
                <div className="flex items-center justify-between py-6 border-t border-border/10">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Syncing <span className="text-foreground">{table.getRowModel().rows.length}</span> of <span className="text-foreground">{table.getFilteredRowModel().rows.length}</span> Active Units
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

            {/* Delete Confirmation Terminal */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="rounded-none border-border/40 bg-background p-12 max-w-md">
                    <DialogHeader className="space-y-4">
                        <div className="w-12 h-12 border border-destructive/20 bg-destructive/5 flex items-center justify-center mb-2 mx-auto">
                            <Trash2 className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-bold tracking-tighter uppercase text-center">Terminate SKU?</DialogTitle>
                        <DialogDescription className="text-center text-xs uppercase tracking-widest leading-relaxed">
                            This action will permanently purge the item from the central database. This cannot be reversed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="rounded-none h-12 px-8 uppercase tracking-widest text-[10px] font-bold border-border/40"
                        >
                            Abort Purge
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteProduct.isPending}
                            className="rounded-none h-12 px-8 uppercase tracking-widest text-[10px] font-bold"
                        >
                            {deleteProduct.isPending ? 'Purging...' : 'Confirm Termination'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
