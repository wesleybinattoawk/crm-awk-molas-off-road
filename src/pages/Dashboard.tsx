import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const { data: clientCount } = useQuery({
    queryKey: ["clientCount"],
    queryFn: async () => {
      const { count } = await supabase.from("clients").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: orderStats } = useQuery({
    queryKey: ["orderStats"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("status, total");
      const pending = data?.filter((o) => o.status === "pending").length ?? 0;
      const inProgress = data?.filter((o) => o.status === "in_progress").length ?? 0;
      const completed = data?.filter((o) => o.status === "completed").length ?? 0;
      const totalRevenue = data?.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.total), 0) ?? 0;
      return { pending, inProgress, completed, total: data?.length ?? 0, totalRevenue };
    },
  });

  const { data: financeStats } = useQuery({
    queryKey: ["financeStats"],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("type, amount");
      const income = data?.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
      const expense = data?.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0) ?? 0;
      return { income, expense, balance: income - expense };
    },
  });

  const cards = [
    { title: "Clientes", value: clientCount ?? 0, icon: Users, color: "text-primary" },
    { title: "Pedidos Ativos", value: (orderStats?.pending ?? 0) + (orderStats?.inProgress ?? 0), icon: ShoppingCart, color: "text-warning" },
    { title: "Receita Total", value: `R$ ${(financeStats?.income ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-success" },
    { title: "Saldo", value: `R$ ${(financeStats?.balance ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pendentes</span>
              <span className="font-medium text-warning">{orderStats?.pending ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Em andamento</span>
              <span className="font-medium text-primary">{orderStats?.inProgress ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Concluídos</span>
              <span className="font-medium text-success">{orderStats?.completed ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Entradas</span>
              <span className="font-medium text-success">
                R$ {(financeStats?.income ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Saídas</span>
              <span className="font-medium text-destructive">
                R$ {(financeStats?.expense ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t pt-3">
              <span className="font-medium">Saldo</span>
              <span className="font-bold">
                R$ {(financeStats?.balance ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
