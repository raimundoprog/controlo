import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils';

function SummaryCard({ title, value, icon: Icon, colorClass, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className="text-2xl font-bold">{formatCurrency(value)}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SummaryCards({ summary, loading }) {
  const cards = [
    {
      title: 'Total Entradas',
      value: summary?.income ?? 0,
      icon: TrendingUp,
      colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      title: 'Total Saídas',
      value: summary?.expense ?? 0,
      icon: TrendingDown,
      colorClass: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      title: 'Saldo',
      value: summary?.balance ?? 0,
      icon: Wallet,
      colorClass: (summary?.balance ?? 0) >= 0
        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    },
    {
      title: 'Transações',
      value: null,
      count: (summary?.incomeCount ?? 0) + (summary?.expenseCount ?? 0),
      icon: Receipt,
      colorClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.colorClass}`}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : card.count !== undefined ? (
              <p className="text-2xl font-bold">{card.count}</p>
            ) : (
              <p className="text-2xl font-bold">{formatCurrency(card.value)}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
