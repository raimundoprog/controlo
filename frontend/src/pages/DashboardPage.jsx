import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { transactionsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import SummaryCards from '../components/dashboard/SummaryCards';
import ExpenseChart from '../components/dashboard/ExpenseChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { MONTHS, YEARS } from '../lib/constants';

export default function DashboardPage() {
  const ALL = 'all';
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { year };
      if (month !== ALL) params.month = month;
      const [sum, txs] = await Promise.all([
        transactionsAPI.getSummary(params),
        transactionsAPI.getAll({ ...params, limit: 10 }),
      ]);
      setSummary(sum);
      setTransactions(txs.transactions);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    if (month === ALL) return;
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === ALL) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={v => setMonth(v === ALL ? ALL : Number(v))}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Ano inteiro</SelectItem>
              {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {/* Summary cards */}
      <SummaryCards summary={summary} loading={loading} />

      {/* Charts + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart breakdown={summary?.categoryBreakdown} loading={loading} />
        <RecentTransactions transactions={transactions} loading={loading} />
      </div>
    </div>
  );
}
