import { Link, useLocation } from "react-router-dom";
import { Home, DollarSign, Bell, Bot, Sprout, Settings } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/transactions", icon: DollarSign, label: "Transaksi" },
    { path: "/reminders", icon: Bell, label: "Reminder" },
    { path: "/bots", icon: Bot, label: "Bot Status" },
    { path: "/farm", icon: Sprout, label: "Virtual Farm" },
    { path: "/settings", icon: Settings, label: "Pengaturan" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card fixed h-screen flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-semibold text-foreground">VA Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Virtual Assistant</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
