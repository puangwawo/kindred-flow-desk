import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: string;
  category: string;
  description: string;
  project: string;
}

const Transactions = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typeValue, setTypeValue] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setFetchingData(true);
      const { data, error } = await supabase.functions.invoke("notion-fetch-transactions");
      
      if (error) throw error;
      
      if (data?.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Gagal memuat data",
        description: "Tidak dapat mengambil data transaksi dari Notion",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    const data = {
      name: (formData.get("name") as string) ?? "",
      date: (formData.get("date") as string) ?? "",
      amount: parseFloat((formData.get("amount") as string) ?? "0"),
      type: (formData.get("type") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      description: (formData.get("description") as string) ?? "",
      project: (formData.get("project") as string) ?? "",
    };

    try {
      const { error } = await supabase.functions.invoke("notion-transactions", {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Transaksi berhasil ditambahkan",
        description: "Data telah disimpan ke Notion",
      });

      formEl.reset();
      setTypeValue("");
      setCategoryValue("");
      setShowForm(false);
      
      // Refresh data
      fetchTransactions();
    } catch (error) {
      toast({
        title: "Gagal menambahkan transaksi",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Transaksi Keuangan</h1>
          <p className="text-muted-foreground">Kelola pemasukan dan pengeluaran Anda</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={20} />
          Tambah Transaksi
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Transaksi Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Transaksi</Label>
              <Input type="text" id="name" name="name" required placeholder="Misal: Gaji Bulanan, Beli Makan" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Tanggal</Label>
                <Input type="date" id="date" name="date" required />
              </div>
              <div>
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input type="number" id="amount" name="amount" required min="0" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipe</Label>
                <Select value={typeValue} onValueChange={setTypeValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="type" value={typeValue} />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={categoryValue} onValueChange={setCategoryValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBR">OBR</SelectItem>
                    <SelectItem value="OBA">OBA</SelectItem>
                    <SelectItem value="OBB">OBB</SelectItem>
                    <SelectItem value="OBS">OBS</SelectItem>
                    <SelectItem value="BBU">BBU</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="category" value={categoryValue} />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" placeholder="Catatan tambahan..." rows={3} />
            </div>

            <div>
              <Label htmlFor="project">Proyek Terkait (Opsional)</Label>
              <Input type="text" id="project" name="project" placeholder="Misal: VA, Bisnis Online" />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setTypeValue(""); setCategoryValue(""); }}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-success" size={24} />
            <h3 className="text-lg font-semibold">Total Pemasukan</h3>
          </div>
          <p className="text-3xl font-semibold">
            {fetchingData ? "Memuat..." : `Rp ${transactions
              .filter(t => t.type === "Pemasukan")
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString("id-ID")}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-destructive" size={24} />
            <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          </div>
          <p className="text-3xl font-semibold">
            {fetchingData ? "Memuat..." : `Rp ${transactions
              .filter(t => t.type === "Pengeluaran")
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString("id-ID")}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi</h2>
        {fetchingData ? (
          <p className="text-muted-foreground">Memuat data...</p>
        ) : transactions.length === 0 ? (
          <p className="text-muted-foreground">Belum ada transaksi. Mulai tambahkan transaksi pertama Anda.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${transaction.type === "Pemasukan" ? "bg-success/10" : "bg-destructive/10"}`}>
                      {transaction.type === "Pemasukan" ? (
                        <TrendingUp className="text-success" size={20} />
                      ) : (
                        <TrendingDown className="text-destructive" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString("id-ID")}
                      </p>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground mt-1">{transaction.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${transaction.type === "Pemasukan" ? "text-success" : "text-destructive"}`}>
                    {transaction.type === "Pemasukan" ? "+" : "-"}Rp {transaction.amount.toLocaleString("id-ID")}
                  </p>
                  {transaction.project && (
                    <p className="text-sm text-muted-foreground">{transaction.project}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transactions;
