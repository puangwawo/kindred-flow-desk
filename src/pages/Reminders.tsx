import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Reminders = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      title: formData.get("title") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const { error } = await supabase.functions.invoke("notion-reminders", {
        body: data,
      });

      if (error) throw error;

      toast({
        title: "Reminder berhasil ditambahkan",
        description: "Data telah disimpan ke Notion",
      });

      setShowForm(false);
      e.currentTarget.reset();
    } catch (error) {
      toast({
        title: "Gagal menambahkan reminder",
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
          <h1 className="text-4xl font-semibold mb-2">Reminder & Schedule</h1>
          <p className="text-muted-foreground">Atur pengingat dan jadwal Anda</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus size={20} />
          Tambah Reminder
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reminder Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Tanggal</Label>
                <Input type="date" id="date" name="date" required />
              </div>
              <div>
                <Label htmlFor="time">Waktu</Label>
                <Input type="time" id="time" name="time" required />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Judul</Label>
              <Input type="text" id="title" name="title" required placeholder="Misal: Meeting dengan Tim" />
            </div>

            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea id="notes" name="notes" placeholder="Detail reminder..." rows={3} />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Reminder Mendatang</h2>
        <div className="space-y-3">
          <p className="text-muted-foreground">Belum ada reminder. Tambahkan reminder untuk tetap terorganisir.</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Reminder Selesai</h2>
        <p className="text-muted-foreground">Belum ada reminder yang diselesaikan.</p>
      </Card>
    </div>
  );
};

export default Reminders;
