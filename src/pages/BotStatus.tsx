import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, XCircle } from "lucide-react";

const BotStatus = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold mb-2">Bot Status</h1>
        <p className="text-muted-foreground">Monitor status semua bot trading Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="text-accent" size={24} />
              <h3 className="text-lg font-semibold">Bot Aktif</h3>
            </div>
            <Badge className="bg-success text-success-foreground">0 Running</Badge>
          </div>
          <p className="text-muted-foreground">Semua bot sedang tidak aktif</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <XCircle className="text-destructive" size={24} />
              <h3 className="text-lg font-semibold">Bot Error</h3>
            </div>
            <Badge variant="destructive">0 Error</Badge>
          </div>
          <p className="text-muted-foreground">Tidak ada bot dengan error</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Daftar Bot</h2>
        <p className="text-muted-foreground">Belum ada data bot. Pastikan Notion database sudah terisi.</p>
      </Card>
    </div>
  );
};

export default BotStatus;
