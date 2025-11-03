import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, Bell, Bot, Sprout, TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState("Rp 0");
  const [totalExpense, setTotalExpense] = useState("Rp 0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionSummary();
  }, []);

  const fetchTransactionSummary = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("notion-fetch-transactions");
      
      if (error) throw error;
      
      if (data?.transactions) {
        const income = data.transactions
          .filter((t: any) => t.type === "Pemasukan")
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        const expense = data.transactions
          .filter((t: any) => t.type === "Pengeluaran")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        setTotalIncome(`Rp ${income.toLocaleString("id-ID")}`);
        setTotalExpense(`Rp ${expense.toLocaleString("id-ID")}`);
      }
    } catch (error) {
      console.error("Error fetching transaction summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Pemasukan",
      value: loading ? "Memuat..." : totalIncome,
      icon: TrendingUp,
      color: "text-success",
      link: "/transactions"
    },
    {
      title: "Total Pengeluaran",
      value: loading ? "Memuat..." : totalExpense,
      icon: TrendingDown,
      color: "text-destructive",
      link: "/transactions"
    },
    {
      title: "Reminder Aktif",
      value: "0",
      icon: Bell,
      color: "text-accent",
      link: "/reminders"
    },
    {
      title: "Bot Running",
      value: "0",
      icon: Bot,
      color: "text-success",
      link: "/bots"
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan aktivitas virtual assistant Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-accent" size={24} />
            <h2 className="text-xl font-semibold">Transaksi Terbaru</h2>
          </div>
          <p className="text-muted-foreground">Belum ada transaksi. Mulai tambahkan transaksi pertama Anda.</p>
          <Link to="/transactions" className="mt-4 inline-block text-accent hover:underline">
            Lihat semua transaksi →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-accent" size={24} />
            <h2 className="text-xl font-semibold">Reminder Mendatang</h2>
          </div>
          <p className="text-muted-foreground">Belum ada reminder. Tambahkan reminder untuk tetap terorganisir.</p>
          <Link to="/reminders" className="mt-4 inline-block text-accent hover:underline">
            Lihat semua reminder →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="text-accent" size={24} />
            <h2 className="text-xl font-semibold">Status Bot</h2>
          </div>
          <p className="text-muted-foreground">Monitor status semua bot trading Anda di sini.</p>
          <Link to="/bots" className="mt-4 inline-block text-accent hover:underline">
            Lihat status bot →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sprout className="text-accent" size={24} />
            <h2 className="text-xl font-semibold">Virtual Farm Timeline</h2>
          </div>
          <p className="text-muted-foreground">Lacak progres proyek pertanian organik Anda.</p>
          <Link to="/farm" className="mt-4 inline-block text-accent hover:underline">
            Lihat timeline →
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
