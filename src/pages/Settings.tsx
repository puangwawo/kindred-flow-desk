import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold mb-2">Pengaturan</h1>
        <p className="text-muted-foreground">Konfigurasi dan preferensi aplikasi</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="text-accent" size={24} />
          <h2 className="text-xl font-semibold">Integrasi Notion</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Status Koneksi</h3>
            <p className="text-sm text-muted-foreground">
              Token API Notion Anda telah tersimpan dengan aman di Lovable Cloud.
            </p>
          </div>
          
          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-2">Database ID yang Terhubung</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-secondary rounded">
                <span className="text-muted-foreground">Transaksi Keuangan:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">08efbd0774044342981e9d04c872a7dd</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary rounded">
                <span className="text-muted-foreground">Reminder & Schedule:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">e885eabb7fb54576b76ae83abe7552cb</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary rounded">
                <span className="text-muted-foreground">Bot Status:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">d4f7e89206fd4630ac7cfbef9c6ba0c0</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary rounded">
                <span className="text-muted-foreground">Virtual Farm:</span>
                <code className="text-xs bg-background px-2 py-1 rounded">3de6e9a2728e4d11b9c3195c9d88a180</code>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-2">Cara Kerja</h3>
            <p className="text-sm text-muted-foreground">
              Aplikasi ini menggunakan Notion API untuk menyimpan dan mengambil data dari database Notion Anda. 
              Pastikan integrasi Notion Anda memiliki akses ke semua database yang tercantum di atas.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
