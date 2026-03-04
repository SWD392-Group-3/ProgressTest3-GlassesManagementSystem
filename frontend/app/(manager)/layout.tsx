import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Tag, 
  Users, 
  LogOut 
} from "lucide-react";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-heading font-bold text-2xl text-primary">Elite</span>
            <span className="font-heading text-2xl text-accent">Manager</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem href="/policies" icon={<FileText size={20} />} label="Policies" />
          <NavItem href="/products" icon={<Package size={20} />} label="Products" />
          <NavItem href="/promotions-combos" icon={<Tag size={20} />} label="Pricing & Promos" />
          <NavItem href="/users" icon={<Users size={20} />} label="Users & Staff" />
        </nav>
        
        <div className="p-4 border-t border-border">
          <button className="flex w-full items-center gap-3 px-3 py-2 text-muted hover:text-red-500 hover:bg-red-50 transition-colors rounded-md">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header (Hidden on large screens) */}
        <header className="md:hidden bg-white border-b border-border p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1">
            <span className="font-heading font-bold text-xl text-primary">Elite</span>
            <span className="font-heading text-xl text-accent">Manager</span>
          </Link>
          <button className="p-2 bg-secondary rounded-md">
            {/* Mobile menu toggle (simplified for now) */}
            <LayoutDashboard size={20} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-[#fafafa]">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-muted hover:text-primary hover:bg-secondary
                  focus:outline-none focus:ring-2 focus:ring-accent/50 group`}
    >
      <span className="text-muted group-hover:text-accent transition-colors">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
