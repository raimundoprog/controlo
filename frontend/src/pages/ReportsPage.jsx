import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { transactionsAPI } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { MONTHS_SHORT, MONTHS, YEARS } from '../lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-md text-sm space-y-1">
        <p className="font-medium">{MONTHS[label - 1]}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnual = useCallback(async () => {
    setLoading(true);
    try {
      const result = await transactionsAPI.getAnnual({ year });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchAnnual(); }, [fetchAnnual]);

  const totals = data?.months?.reduce(
    (acc, m) => ({ income: acc.income + m.income, expense: acc.expense + m.expense, balance: acc.balance + m.balance }),
    { income: 0, expense: 0, balance: 0 }
  );

  const chartData = data?.months?.map((m, i) => ({
    month: i + 1,
    label: MONTHS_SHORT[i],
    Entradas: m.income,
    Saídas: m.expense,
    Saldo: m.balance,
  }));

  return (
    <div className="space-y-6">
      {/* Year selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Relatório Anual</h2>
          <p className="text-sm text-muted-foreground">Visão geral de {year}</p>
        </div>
        <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Annual table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Mês</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Entradas</TableHead>
                    <TableHead className="text-right">Saídas</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.months?.map((m, i) => {
                    const hasData = m.income > 0 || m.expense > 0;
                    return (
                      <TableRow key={i} className={!hasData ? 'opacity-40' : ''}>
                        <TableCell className="font-medium">{MONTHS[i]}</TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                          {m.income > 0 ? formatCurrency(m.income) : '—'}
                        </TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">
                          {m.expense > 0 ? formatCurrency(m.expense) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {hasData ? (
                            <Badge variant={m.balance >= 0 ? 'income' : 'expense'}>
                              {m.balance >= 0 ? '+' : ''}{formatCurrency(m.balance)}
                            </Badge>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                {totals && (
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Total {year}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totals.income)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(totals.expense)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={totals.balance >= 0 ? 'income' : 'expense'} className="font-bold">
                          {totals.balance >= 0 ? '+' : ''}{formatCurrency(totals.balance)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
