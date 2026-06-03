import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Reminder {
  id: string;
  date: string;
  time: string;
  title: string;
  notes: string;
  status: string;
}

const Reminders = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchReminders = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("notion-fetch-reminders");
      if (error) throw error;
      setReminders(data?.reminders || []);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

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
        description: "Notifikasi telah dikirim ke Telegram",
      });

      setShowForm(false);
      e.currentTarget.reset();
      fetchReminders();
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
          <p className="text-muted-foreground">Pengingat tersimpan di Google Sheet & terkirim ke Telegram</p>
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
                {loading ? "Mengirim..." : (<><Send size={16} className="mr-2" /> Simpan & Kirim</>)}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Semua Reminder</h2>
        {fetching ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : reminders.length === 0 ? (
          <p className="text-muted-foreground">Belum ada reminder. Tambahkan reminder untuk tetap terorganisir.</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => (
              <div key={r.id} className="p-4 border border-border rounded-lg flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{r.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {r.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {r.time}</span>
                  </div>
                  {r.notes && <p className="text-sm text-muted-foreground mt-2">{r.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reminders;
