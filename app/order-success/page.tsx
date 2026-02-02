import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';

interface OrderSuccessPageProps {
    searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
    const params = await searchParams;
    const orderNumber = params.orderNumber || 'N/A';

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>

                <div>
                    <h1 className="text-2xl font-bold mb-2">Order Submitted!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your order request. Our team will review and confirm your order shortly.
                    </p>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <Package className="w-5 h-5" />
                        <span className="font-semibold">Order Number</span>
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-wider">
                        {orderNumber}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Please save this number for your reference
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 rounded-xl p-4 text-left">
                    <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">What happens next?</h3>
                    <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-2">
                        <li>• Our team will verify your order details</li>
                        <li>• You'll receive a confirmation call/email within 24 hours</li>
                        <li>• Final pricing and delivery schedule will be confirmed</li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link href="/products" className="flex-1">
                        <Button variant="outline" className="w-full">
                            Continue Shopping
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/" className="flex-1">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
