'use client';

import { useProducts, useDeleteProduct, useCategories } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
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
import { ArrowUpDown, Edit, Trash2, Plus, Search, Loader2, Leaf } from 'lucide-react';
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

const UNIT_LABELS: Record<string, string> = {
    KG: 'kg',
    TON: 'ton',
    BAG: 'bag',
    CRATE: 'crate',
    DOZEN: 'dz',
    PIECE: 'pc',
    LITER: 'L',
};

export default function ProductsManagementPage() {
    const { data: products, isLoading } = useProducts();
    const { data: categories } = useCategories(false);
    const deleteProduct = useDeleteProduct();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="p-0 font-semibold hover:bg-transparent"
                >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="font-medium">{row.getValue('name')}</div>
                        {product.isOrganic && (
                            <Leaf className="h-4 w-4 text-green-600" />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'category',
            header: () => <span className="font-semibold">Category</span>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <Badge variant="outline" className="text-xs">
                        {product.category?.displayName || 'Uncategorized'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'pricePerUnit',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="p-0 font-semibold hover:bg-transparent"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const product = row.original;
                const unit = UNIT_LABELS[product.unitType] || product.unitType;
                return (
                    <div className="font-medium tabular-nums">
                        ₹{product.pricePerUnit.toLocaleString()}/{unit}
                    </div>
                );
            },
        },
        {
            accessorKey: 'stockQty',
            header: () => <span className="font-semibold">Stock</span>,
            cell: ({ row }) => {
                const product = row.original;
                const isLowStock = product.stockQty <= product.lowStockAlert;
                const unit = UNIT_LABELS[product.unitType] || product.unitType;
                return (
                    <div className={cn(
                        "font-medium tabular-nums",
                        isLowStock && product.stockQty > 0 && "text-amber-600",
                        product.stockQty === 0 && "text-red-600"
                    )}>
                        {product.stockQty.toLocaleString()} {unit}
                        {isLowStock && product.stockQty > 0 && (
                            <span className="ml-2 text-xs text-amber-600">(Low)</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'minOrderQty',
            header: () => <span className="font-semibold">MOQ</span>,
            cell: ({ row }) => {
                const product = row.original;
                const unit = UNIT_LABELS[product.unitType] || product.unitType;
                return (
                    <div className="text-muted-foreground tabular-nums">
                        {product.minOrderQty} {unit}
                    </div>
                );
            },
        },
        {
            accessorKey: 'isActive',
            header: () => <span className="font-semibold">Status</span>,
            cell: ({ row }) => {
                const isActive = row.getValue('isActive') as boolean;
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isActive ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <span className={cn(
                            "text-sm",
                            isActive ? "text-green-600" : "text-muted-foreground"
                        )}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: () => <span className="font-semibold">Actions</span>,
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <Link href={`/admin/products/edit?id=${product.id}`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                                setProductToDelete(product.id);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
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
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <p className="text-muted-foreground">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your farm produce catalog
                    </p>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border p-4 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn('name')?.setFilterValue(event.target.value)
                        }
                        className="pl-10"
                    />
                </div>
                
                <Select
                    value={(table.getColumn('category')?.getFilterValue() as string) ?? 'all'}
                    onValueChange={(value) =>
                        table.getColumn('category')?.setFilterValue(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.displayName || cat.name}>
                                {cat.icon} {cat.displayName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={(table.getColumn('isActive')?.getFilterValue() as string) ?? 'all'}
                    onValueChange={(value) =>
                        table.getColumn('isActive')?.setFilterValue(
                            value === 'all' ? '' : value === 'true'
                        )
                    }
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
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
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                    className="h-32 text-center text-muted-foreground"
                                >
                                    No products found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {table.getRowModel().rows.length} of {products?.length || 0} products
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. The product will be permanently removed from your catalog.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteProduct.isPending}
                        >
                            {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
