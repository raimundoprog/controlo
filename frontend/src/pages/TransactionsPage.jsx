import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { transactionsAPI, categoriesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionForm from '../components/transactions/TransactionForm';
import { MONTHS, YEARS } from '../lib/constants';

const ALL = 'all';

export default function TransactionsPage() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [type, setType] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchCategories = () => categoriesAPI.getAll().then(d => setCategories(d.categories)).catch(() => {});

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { year, limit: 200 };
      if (month !== ALL) params.month = month;
      if (type !== ALL) params.type = type;
      if (category !== ALL) params.category = category;
      const data = await transactionsAPI.getAll(params);
      setTransactions(data.transactions);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [month, year, type, category]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const filtered = search
    ? transactions.filter(tx =>
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const openAdd = () => { setEditTarget(null); setFormOpen(true); };
  const openEdit = (tx) => { setEditTarget(tx); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditTarget(null); };

  const clearFilters = () => {
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
    setType(ALL);
    setCategory(ALL);
    setSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Transações</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} transação(ões) encontrada(s)</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os meses</SelectItem>
            {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os tipos</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {categories.map(cat => <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <TransactionTable
        transactions={filtered}
        loading={loading}
        onEdit={openEdit}
        onDeleted={fetchTransactions}
      />

      {/* Form modal */}
      <TransactionForm
        open={formOpen}
        onClose={closeForm}
        onSuccess={fetchTransactions}
        transaction={editTarget}
      />
    </div>
  );
}
