import { useQuery } from '@tanstack/react-query';

// AgroOrder uses a single currency (INR)
// This hook returns the default currency settings

interface Currency {
  label: string;
  symbol: string;
}

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const res = await fetch('/api/currencies');
      const data = await res.json();
      
      if (data.success) {
        return data.data as Currency[];
      }
      
      // Fallback to default INR
      return [{ label: 'INR', symbol: '₹' }] as Currency[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Convenience hook to get the default currency
export function useCurrency() {
  const { data } = useCurrencies();
  return data?.[0] || { label: 'INR', symbol: '₹' };
}
