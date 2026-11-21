import React from 'react';
import {
  LayoutDashboard,
  HeartHandshake,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import utecLogo from '../../assets/utec-logo.jpg';

export default function Sidebar({
  activeTab,
  onSelectTab,
  violationsCount,
  connectionMode,
  gatewayOnline,
}) {
  const navItems = [
    { id: 'overview', label: 'Bienestar del Aula', icon: LayoutDashboard },
    {
      id: 'diagnostic',
      label: 'Recomendaciones',
      icon: HeartHandshake,
      badge: violationsCount > 0 ? violationsCount : null,
    },
  ];

  const sourceLabel =
    connectionMode === 'hardware'
      ? 'Red Wi-Fi en Vivo (ESP32)'
      : 'Simulación de Datos';

  return (
    <aside className="w-16 md:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 shadow-xl">
      <div>
        {/* Encabezado con Logo UTEC y Efecto Glow */}
        <div className="h-20 px-4 flex items-center gap-3 border-b border-slate-800/80 bg-slate-900/60">
          <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-lg shadow-cyan-950/40 shrink-0 border border-slate-700">
            <img
              src={utecLogo}
              alt="UTEC Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <span>UTEC</span>
              <span className="text-[10px] font-extrabold text-cyan-300 bg-cyan-950/90 border border-cyan-800 px-1.5 py-0.2 rounded-md">
                L418
              </span>
            </div>
            <div className="text-[11px] text-cyan-400/90 font-semibold truncate">
              Aula Pensante &amp; Confort
            </div>
          </div>
        </div>

        {/* Navegación con colores sólidos */}
        <nav className="p-3 space-y-2 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/70 border border-indigo-500'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="hidden md:inline">{item.label}</span>
                </span>
                {item.badge && (
                  <span className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white animate-pulse shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800/80 hidden md:block space-y-2.5 bg-slate-900/30">
        {/* Modo de Operación con Iconos Vibrantes */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Modo Actual
            </span>
            {gatewayOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className="mt-1 text-xs font-bold text-white truncate">
            {sourceLabel}
          </div>
          <div className="mt-0.5 text-[10px] text-cyan-300/80">
            Actualización cada 2s
          </div>
        </div>

        {/* Estado Global con Animación Neón */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ambiente del Salón
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            {violationsCount === 0 ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-400">
                  Condiciones Ideales
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span className="text-xs font-bold text-rose-400">
                  {violationsCount}{' '}
                  {violationsCount === 1 ? 'Aviso Activo' : 'Avisos Activos'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
