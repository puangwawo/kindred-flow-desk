import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  // Filter states
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

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

  // Filtered and grouped transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      // Filter by month
      if (filterMonth) {
        const [year, month] = filterMonth.split("-");
        if (transactionDate.getFullYear() !== parseInt(year) || 
            transactionDate.getMonth() + 1 !== parseInt(month)) {
          return false;
        }
      }
      
      // Filter by date range
      if (filterStartDate && transactionDate < new Date(filterStartDate)) {
        return false;
      }
      if (filterEndDate && transactionDate > new Date(filterEndDate)) {
        return false;
      }
      
      // Filter by category
      if (filterCategory && transaction.category !== filterCategory) {
        return false;
      }
      
      return true;
    });
  }, [transactions, filterMonth, filterStartDate, filterEndDate, filterCategory]);

  const transactionsByCategory = useMemo(() => {
    const grouped: { [key: string]: { income: Transaction[], expense: Transaction[], incomeTotal: number, expenseTotal: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      if (!grouped[transaction.category]) {
        grouped[transaction.category] = { income: [], expense: [], incomeTotal: 0, expenseTotal: 0 };
      }
      
      if (transaction.type === "Pemasukan") {
        grouped[transaction.category].income.push(transaction);
        grouped[transaction.category].incomeTotal += transaction.amount;
      } else {
        grouped[transaction.category].expense.push(transaction);
        grouped[transaction.category].expenseTotal += transaction.amount;
      }
    });
    
    return grouped;
  }, [filteredTransactions]);

  const clearFilters = () => {
    setFilterMonth("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterCategory("");
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter size={20} />
            Filter
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus size={20} />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Filter Transaksi</h2>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X size={16} />
              Hapus Filter
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterMonth">Bulan</Label>
              <Input 
                type="month" 
                id="filterMonth" 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterStartDate">Dari Tanggal</Label>
              <Input 
                type="date" 
                id="filterStartDate" 
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterEndDate">Sampai Tanggal</Label>
              <Input 
                type="date" 
                id="filterEndDate" 
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterCategory">Kategori</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua kategori</SelectItem>
                  <SelectItem value="OBR">OBR</SelectItem>
                  <SelectItem value="OBA">OBA</SelectItem>
                  <SelectItem value="OBB">OBB</SelectItem>
                  <SelectItem value="OBS">OBS</SelectItem>
                  <SelectItem value="BBU">BBU</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

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
            {fetchingData ? "Memuat..." : `Rp ${filteredTransactions
              .filter(t => t.type === "Pemasukan")
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString("id-ID")}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {filterMonth || filterStartDate || filterEndDate || filterCategory ? "Terfilter" : "Total"}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-destructive" size={24} />
            <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          </div>
          <p className="text-3xl font-semibold">
            {fetchingData ? "Memuat..." : `Rp ${filteredTransactions
              .filter(t => t.type === "Pengeluaran")
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString("id-ID")}`}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {filterMonth || filterStartDate || filterEndDate || filterCategory ? "Terfilter" : "Total"}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi</h2>
        {fetchingData ? (
          <p className="text-muted-foreground">Memuat data...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-muted-foreground">
            {transactions.length === 0 
              ? "Belum ada transaksi. Mulai tambahkan transaksi pertama Anda."
              : "Tidak ada transaksi yang sesuai dengan filter."}
          </p>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="category">Per Kategori</TabsTrigger>
              <TabsTrigger value="type">Per Tipe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-3 mt-4">
              {filteredTransactions.map((transaction) => (
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
            </TabsContent>

            <TabsContent value="category" className="space-y-6 mt-4">
              {Object.entries(transactionsByCategory).map(([category, data]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{category}</h3>
                    <div className="flex gap-4 text-sm">
                      {data.incomeTotal > 0 && (
                        <span className="text-success">
                          +Rp {data.incomeTotal.toLocaleString("id-ID")}
                        </span>
                      )}
                      {data.expenseTotal > 0 && (
                        <span className="text-destructive">
                          -Rp {data.expenseTotal.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[...data.income, ...data.expense].map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${transaction.type === "Pemasukan" ? "bg-success/10" : "bg-destructive/10"}`}>
                              {transaction.type === "Pemasukan" ? (
                                <TrendingUp className="text-success" size={16} />
                              ) : (
                                <TrendingDown className="text-destructive" size={16} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString("id-ID")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm font-semibold ${transaction.type === "Pemasukan" ? "text-success" : "text-destructive"}`}>
                          {transaction.type === "Pemasukan" ? "+" : "-"}Rp {transaction.amount.toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="type" className="space-y-6 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-success">Pemasukan</h3>
                  <span className="text-success font-semibold">
                    Rp {filteredTransactions
                      .filter(t => t.type === "Pemasukan")
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
                {filteredTransactions.filter(t => t.type === "Pemasukan").map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-success">
                      +Rp {transaction.amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-destructive">Pengeluaran</h3>
                  <span className="text-destructive font-semibold">
                    Rp {filteredTransactions
                      .filter(t => t.type === "Pengeluaran")
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
                {filteredTransactions.filter(t => t.type === "Pengeluaran").map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-destructive">
                      -Rp {transaction.amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default Transactions;
