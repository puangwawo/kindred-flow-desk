import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Transactions = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typeValue, setTypeValue] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string>("");

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
                    <SelectItem value="Makanan">Makanan</SelectItem>
                    <SelectItem value="Transportasi">Transportasi</SelectItem>
                    <SelectItem value="Tagihan">Tagihan</SelectItem>
                    <SelectItem value="Gaji">Gaji</SelectItem>
                    <SelectItem value="Penjualan">Penjualan</SelectItem>
                    <SelectItem value="Hiburan">Hiburan</SelectItem>
                    <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                    <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                    <SelectItem value="Peralatan">Peralatan</SelectItem>
                    <SelectItem value="Rumah Tangga">Rumah Tangga</SelectItem>
                    <SelectItem value="Donasi">Donasi</SelectItem>
                    <SelectItem value="Investasi">Investasi</SelectItem>
                    <SelectItem value="Pajak">Pajak</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
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
          <p className="text-3xl font-semibold">Rp 0</p>
          <p className="text-sm text-muted-foreground mt-1">Bulan ini</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="text-destructive" size={24} />
            <h3 className="text-lg font-semibold">Total Pengeluaran</h3>
          </div>
          <p className="text-3xl font-semibold">Rp 0</p>
          <p className="text-sm text-muted-foreground mt-1">Bulan ini</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi</h2>
        <p className="text-muted-foreground">Belum ada transaksi. Mulai tambahkan transaksi pertama Anda.</p>
      </Card>
    </div>
  );
};

export default Transactions;
