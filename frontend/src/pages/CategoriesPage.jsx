import { useState, useEffect } from 'react';
import { Plus, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { categoriesAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
});

function AddCategoryDialog({ open, onClose, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', color: '#6366f1' },
  });

  const onSubmit = async (data) => {
    try {
      await categoriesAPI.create(data);
      toast.success('Categoria criada');
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Erro ao criar categoria');
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catName">Nome</Label>
            <Input id="catName" placeholder="Ex: Ginásio" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="catColor">Cor</Label>
            <div className="flex items-center gap-3">
              <input type="color" id="catColor" className="h-9 w-14 rounded-md cursor-pointer border border-input" {...register('color')} />
              <Input placeholder="#6366f1" {...register('color')} className="flex-1" />
            </div>
            {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data.categories);
    } catch { } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async () => {
    try {
      await categoriesAPI.delete(deleteTarget);
      toast.success('Categoria eliminada');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      toast.error(err?.message || 'Erro ao eliminar');
    }
  };

  const defaults = categories.filter(c => c.isDefault);
  const custom = categories.filter(c => !c.isDefault);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Categorias</h2>
          <p className="text-sm text-muted-foreground">{categories.length} categorias no total</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Default categories */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Categorias padrão</h3>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {defaults.map(cat => (
              <Card key={cat._id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">Padrão</Badge>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: cat.color }} />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Custom categories */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Categorias personalizadas {custom.length > 0 && `(${custom.length})`}
        </h3>
        {!loading && custom.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p className="text-sm">Ainda não criaste categorias personalizadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {custom.map(cat => (
              <Card key={cat._id} className="relative overflow-hidden group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(cat._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: cat.color }} />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add dialog */}
      <AddCategoryDialog open={addOpen} onClose={() => setAddOpen(false)} onSuccess={fetchCategories} />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Eliminar categoria</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Tens a certeza? As transações com esta categoria não serão afetadas.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
