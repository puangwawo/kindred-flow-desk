import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Calendar, CheckCircle2, Clock } from "lucide-react";

const VirtualFarm = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold mb-2">Virtual Farm Timeline</h1>
        <p className="text-muted-foreground">Lacak progres proyek pertanian organik Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Sprout className="text-accent" size={24} />
            <h3 className="text-lg font-semibold">Total Task</h3>
          </div>
          <p className="text-3xl font-semibold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Task keseluruhan</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-warning" size={24} />
            <h3 className="text-lg font-semibold">Dalam Progres</h3>
          </div>
          <p className="text-3xl font-semibold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Task aktif</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-success" size={24} />
            <h3 className="text-lg font-semibold">Selesai</h3>
          </div>
          <p className="text-3xl font-semibold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Task selesai</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Timeline Proyek</h2>
        <p className="text-muted-foreground">Belum ada task. Mulai tambahkan task proyek Anda di Notion.</p>
      </Card>
    </div>
  );
};

export default VirtualFarm;
