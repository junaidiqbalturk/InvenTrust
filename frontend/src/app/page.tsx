"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Activity, 
    DollarSign, 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    Package, 
    ShoppingCart,
    Loader2,
    BarChart3,
    LineChart,
    CheckCircle2,
    FolderTree,
    Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LandingPage = dynamic(() => import("@/components/marketing/LandingPage"), {
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#020617]">
      <Activity className="animate-spin h-8 w-8 text-[#059669]" />
    </div>
  ),
});

const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });

interface DashboardData {
  kpis: {
    total_sales: number;
    receivables: number;
    payables: number;
    profit: number;
  };
  charts: {
    trends: { month: string, total: number }[];
    categories: { category: string, value: number }[];
  };
  smart_feed?: {
    total_reconciled: number;
    recent_actions: any[];
  };
  coa_count: number;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      api.get("/dashboard").then((res) => {
        setData(res.data);
      }).catch(err => {
        console.error("Dashboard Fetch Error:", err);
      }).finally(() => {
        setLoadingData(false);
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const kpiItems = [
    { title: "Total Sales", value: data?.kpis.total_sales, icon: DollarSign, color: "text-[#059669]", bg: "bg-[#059669]/10" },
    { title: "Receivables", value: data?.kpis.receivables, icon: ArrowUpRight, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
    { title: "Payables", value: data?.kpis.payables, icon: ArrowDownRight, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Estimated Profit", value: data?.kpis.profit, icon: TrendingUp, color: "text-[#34D399]", bg: "bg-[#34D399]/10" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {data?.coa_count && data.coa_count < 10 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <FolderTree className="h-40 w-40 text-primary" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">Complete Your Financial Foundation</h2>
              <p className="text-slate-400 font-medium max-w-md mt-1">We noticed your ledger is minimal. Define your specific business accounts (Rent, Salaries, etc.) to get accurate financial reports.</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/accounting/accounts'}
            className="h-14 px-8 bg-white text-primary hover:bg-slate-100 font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 relative z-10"
          >
            Configure Ledger <ArrowUpRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      )}

      <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Overview</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user.name}. Here's what's happening today.</p>
          </div>
          <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Real-time Data
              </span>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiItems.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 relative group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between relative z-10">
                  <div className={`p-3 rounded-2xl ${kpi.bg} transition-transform group-hover:scale-110 duration-300`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
                <div className="mt-4 relative z-10">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{kpi.title}</p>
                  <h3 className="text-3xl font-black mt-1">
                    {loadingData ? "..." : `$${kpi.value?.toLocaleString()}`}
                  </h3>
                </div>
                {/* Watermark Icon */}
                <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                    <kpi.icon className={`h-24 w-24 ${kpi.color}`} strokeWidth={1} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="px-0 pt-0 relative z-10">
                  <CardTitle className="text-xl font-bold">Sales Trends</CardTitle>
                  <CardDescription>Revenue movement over the last 6 months</CardDescription>
              </CardHeader>
              <div className="h-[300px] w-full mt-4 relative z-10">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <AreaChart data={data?.charts.trends || []}>
                          <defs>
                              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            name="Sales"
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3} 
                            fillOpacity={1}
                            fill="url(#colorSales)"
                          />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
              {/* Watermark Icon */}
              <div className="absolute -bottom-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
                <LineChart className="h-48 w-48 text-primary" strokeWidth={1} />
              </div>
          </Card>

          <Card className="border-none shadow-sm p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="px-0 pt-0 relative z-10">
                  <CardTitle className="text-xl font-bold">Category Performance</CardTitle>
                  <CardDescription>Sales distribution by product category</CardDescription>
              </CardHeader>
              <div className="h-[300px] w-full mt-4 relative z-10">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart data={data?.charts.categories || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <Tooltip 
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="value" name="Sales Revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
              {/* Watermark Icon */}
              <div className="absolute -bottom-6 -right-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500">
                <BarChart3 className="h-48 w-48 text-primary" strokeWidth={1} />
              </div>
          </Card>
      </div>

      {/* InvenIQ Smart Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Smart Feed */}
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white/40 backdrop-blur-xl border-t border-white/20">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary animate-pulse" />
                          InvenIQ Smart Feed
                      </CardTitle>
                      <CardDescription>Automated accounting activity and audit insights</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {data?.smart_feed?.total_reconciled || 0} Auto-reconciled
                  </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                  {data?.smart_feed?.recent_actions && data.smart_feed.recent_actions.length > 0 ? (
                      <div className="space-y-3">
                          {data.smart_feed.recent_actions.map((action: any) => (
                              <div key={action.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100 hover:border-primary/30 transition-all hover:translate-x-1 duration-200">
                                  <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-zinc-900">{action.description}</p>
                                          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">{action.date}</p>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-sm font-black text-emerald-600">
                                          +{Math.abs(action.amount).toLocaleString()}
                                      </p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="py-10 text-center space-y-2 opacity-50 grayscale">
                          <Activity className="h-10 w-10 mx-auto text-zinc-300" />
                          <p className="text-sm font-medium">No recent automated activity</p>
                      </div>
                  )}
                  <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 mt-2" onClick={() => window.location.href = '/accounting/reconcile'}>
                      View Detailed Log <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
              </CardContent>
          </Card>

          {/* Core Actions Map */}
          <div className="space-y-6">
              <Card className="group hover:bg-primary transition-all duration-500 cursor-pointer border-none shadow-sm hover:shadow-2xl relative overflow-hidden" onClick={() => window.location.href = '/sales'}>
                  <CardContent className="p-8 flex items-center gap-6 relative z-10">
                      <div className="bg-primary/10 group-hover:bg-white/20 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110">
                          <ShoppingCart className="h-8 w-8 text-primary group-hover:text-white" />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold group-hover:text-white">New Sale</h3>
                          <p className="text-muted-foreground group-hover:text-white/70">Create a new invoice</p>
                      </div>
                  </CardContent>
              </Card>
              
              <Card className="group hover:bg-[#059669] transition-all duration-500 cursor-pointer border-none shadow-sm hover:shadow-2xl relative overflow-hidden" onClick={() => window.location.href = '/inventory'}>
                  <CardContent className="p-8 flex items-center gap-6 relative z-10">
                      <div className="bg-[#059669]/10 group-hover:bg-white/20 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110">
                          <Package className="h-8 w-8 text-[#059669] group-hover:text-white" />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold group-hover:text-white">Check Stock</h3>
                          <p className="text-muted-foreground group-hover:text-white/70">Inventory levels</p>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}
