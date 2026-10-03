import React from 'react';
import { Smartphone, Activity, Sparkles, Database, Car } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenQuickDemo }) => {
  const navItems = [
    { id: 'whatsapp-bot', label: 'Bot WhatsApp' },
    { id: 'admin-dispatch', label: 'Panel Despacho & Radar' },
    { id: 'surge-pricing', label: 'Tarifas Dinámicas' },
    { id: 'promotions', label: 'Alertas & Descuentos' },
    { id: 'trip-history', label: 'Historial' },
    { id: 'driver-quality', label: 'Calidad & Ratings' },
    { id: 'cloud-architecture', label: 'Arquitectura Cloud (AWS/GCP)' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('whatsapp-bot');
            }}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white group"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-sm font-semibold group-hover:border-emerald-400 transition-colors">
              U
            </span>
            <span className="text-white">Ubinow</span>
            <span className="text-xs font-mono font-normal text-slate-400 ml-1">Mobility Engine</span>
          </a>
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors text-left relative py-1 text-xs xl:text-sm ${
                activeTab === item.id
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenQuickDemo}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-lg transition-all shadow-sm shadow-emerald-500/10"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Probar Bot WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar horizontal scroller */}
      <div className="lg:hidden flex items-center gap-4 overflow-x-auto no-scrollbar pt-3 border-t border-slate-900 mt-2 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap pb-1 ${
              activeTab === item.id
                ? 'text-emerald-400 font-semibold border-b border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
