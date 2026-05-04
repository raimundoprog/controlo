import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { transactionsAPI } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';

function DeleteDialog({ open, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar transação</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Tens a certeza que queres eliminar esta transação? Esta ação não pode ser desfeita.</p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TransactionTable({ transactions, loading, onEdit, onDeleted }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    try {
      await transactionsAPI.delete(deleteTarget);
      toast.success('Transação eliminada');
      setDeleteTarget(null);
      onDeleted();
    } catch (err) {
      toast.error(err?.message || 'Erro ao eliminar');
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium mb-1">Sem transações</p>
        <p className="text-sm">Adiciona a tua primeira transação com o botão acima.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx._id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">{tx.description || '—'}</TableCell>
                <TableCell>
                  <span className="text-sm">{tx.category}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={tx.type === 'income' ? 'income' : 'expense'}>
                    {tx.type === 'income' ? 'Entrada' : 'Saída'}
                  </Badge>
                </TableCell>
                <TableCell className={`text-right font-semibold text-sm ${
                  tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.value)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(tx)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(tx._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </>
  );
}
