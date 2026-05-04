import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '../../lib/utils';
import { CHART_COLORS } from '../../lib/constants';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-md text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
        <p className="text-muted-foreground">{payload[0].payload.percent}%</p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ breakdown, loading }) {
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
        <CardContent><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
    );
  }

  if (!breakdown?.length) {
    return (
      <Card>
        <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground text-sm">
          Sem despesas neste período
        </CardContent>
      </Card>
    );
  }

  const total = breakdown.reduce((sum, item) => sum + item.total, 0);
  const data = breakdown.map(item => ({
    name: item._id,
    value: item.total,
    percent: total > 0 ? ((item.total / total) * 100).toFixed(1) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
