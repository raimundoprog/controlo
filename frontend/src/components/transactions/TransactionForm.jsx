import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { transactionsAPI, categoriesAPI } from '../../lib/api';
import { todayISO } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  value: z.coerce.number({ invalid_type_error: 'Valor inválido' }).min(0.01, 'Valor deve ser maior que 0'),
  date: z.string().min(1, 'Data é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().max(500).optional(),
});

export default function TransactionForm({ open, onClose, onSuccess, transaction }) {
  const [categories, setCategories] = useState([]);
  const isEdit = !!transaction;

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      value: '',
      date: todayISO(),
      category: '',
      description: '',
    },
  });

  useEffect(() => {
    categoriesAPI.getAll().then(d => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        value: transaction.value,
        date: transaction.date?.slice(0, 10),
        category: transaction.category,
        description: transaction.description || '',
      });
    } else {
      reset({ type: 'expense', value: '', date: todayISO(), category: '', description: '' });
    }
  }, [transaction, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await transactionsAPI.update(transaction._id, data);
        toast.success('Transação atualizada');
      } else {
        await transactionsAPI.create(data);
        toast.success('Transação criada');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Erro ao guardar transação');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      field.value === 'expense'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-input hover:bg-accent'
                    }`}
                    onClick={() => field.onChange('expense')}
                  >
                    Saída
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      field.value === 'income'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-input hover:bg-accent'
                    }`}
                    onClick={() => field.onChange('income')}
                  >
                    Entrada
                  </button>
                </div>
              )}
            />
          </div>

          {/* Value */}
          <div className="space-y-2">
            <Label htmlFor="value">Valor (€)</Label>
            <Input id="value" type="number" step="0.01" min="0.01" placeholder="0,00" {...register('value')} />
            {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat._id} value={cat.name}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: cat.color }} />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input id="description" placeholder="Nota sobre esta transação" {...register('description')} />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Guardar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
