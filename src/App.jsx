import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Cpu,
  Sliders,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  School,
  Bell,
  Clock,
} from 'lucide-react';
import { SCENARIOS } from './data/sensorsCatalog';
import {
  generateReadingForScenario,
  evaluateStates,
  createInitialHistory,
} from './data/simulator';
import RadialGauge from './components/RadialGauge';
import {
  DualTrendChart,
  MultiSensorBarChart,
  DarkTelemetryRow,
} from './components/TelemetryCharts';
import DiagnosticView from './components/DiagnosticView';
import SensorCatalogView from './components/SensorCatalogView';
import SensorIcon from './components/SensorIcon';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [scenarioId, setScenarioId] = useState('nominal');
  const [isPlaying, setIsPlaying] = useState(true);
  const [history, setHistory] = useState(() => createInitialHistory('nominal', 16));
  const [selectedViolationId, setSelectedViolationId] = useState(null);

  // Update history immediately when scenario changes (so 5-sample moving average reflects it right away)
  const handleScenarioChange = (newScenarioId) => {
    setScenarioId(newScenarioId);
    setHistory(createInitialHistory(newScenarioId, 16));
  };

  // Live telemetry simulation tick
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      const next = generateReadingForScenario(scenarioId);
      setHistory((prev) => [...prev.slice(1), next]);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPlaying, scenarioId]);

  const latest = history[history.length - 1];
  const { evaluations, violations } = useMemo(() => evaluateStates(history), [history]);

  const openDiagnosticForViolation = (idOrSensorId) => {
    setSelectedViolationId(idOrSensorId);
    setActiveTab('diagnostic');
  };

  const navItems = [
    { id: 'overview', label: 'Monitor General', icon: LayoutDashboard },
    {
      id: 'diagnostic',
      label: 'Diagnóstico y Fallas',
      icon: ShieldAlert,
      badge: violations.length > 0 ? violations.length : null,
    },
    { id: 'catalog', label: 'Catálogo de Sensores', icon: Cpu },
    { id: 'simulator', label: 'Simulador de Escenarios', icon: Sliders },
  ];

  const getEval = (key) => evaluations.find((e) => e.variableKey === key);
  const co2Eval = getEval('co2');
  const tempEval = getEval('temperature');
  const humEval = getEval('humidity');
  const pressEval = getEval('pressure');
  const luxEval = getEval('lux');
  const noiseEval = getEval('noise');
  const gasEval = getEval('gasPpm');
  const hallEval = getEval('hallMag');

  const kpiCards = [
    { evalItem: luxEval, icon: 'Sun', accent: 'text-amber-600 bg-amber-50' },
    { evalItem: noiseEval, icon: 'Mic', accent: 'text-pink-600 bg-pink-50' },
    { evalItem: gasEval, icon: 'Flame', accent: 'text-rose-600 bg-rose-50' },
    { evalItem: hallEval, icon: 'Magnet', accent: 'text-violet-600 bg-violet-50' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Left Sidebar (MobiusFlow inspired, Indigo-Cyan theme) */}
      <aside className="w-16 md:w-60 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-extrabold text-white tracking-tight">
                AulaSmart <span className="text-cyan-400">IoT</span>
              </div>
              <div className="text-[10px] text-slate-400">Telemetría & OR-AND</div>
            </div>
          </div>

          <nav className="p-2.5 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden md:inline">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-800/80 hidden md:block">
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Estado Global del Aula
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              {violations.length === 0 ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">NOMINAL (6/6 Kits)</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-red-400">
                    {violations.length} {violations.length === 1 ? 'VIOLACIÓN' : 'VIOLACIONES'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900 text-white px-4 md:px-6 flex items-center justify-between gap-3 border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm md:text-base font-bold truncate">
              Aula Inteligente 304 — Monitor Ambiental y Diagnóstico Causal
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
              <Clock className="w-3 h-3" />
              {latest.timestamp}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick scenario switcher */}
            <select
              value={scenarioId}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="hidden sm:block bg-slate-800 text-slate-100 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              title="Simular escenario del aula"
            >
              {SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  Simular: {sc.label}
                </option>
              ))}
            </select>

            {/* Play / Pause simulation */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                isPlaying
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isPlaying ? 'En vivo' : 'Pausado'}</span>
            </button>

            {/* Alert indicator pill */}
            <button
              onClick={() =>
                openDiagnosticForViolation(violations[0]?.id || null)
              }
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                violations.length > 0
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/40 animate-pulse'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>
                {violations.length > 0
                  ? `${violations.length} Alerta${violations.length > 1 ? 's' : ''}`
                  : 'Nominal'}
              </span>
            </button>
          </div>
        </header>

        {/* Floating / Prominent On-Screen Alert Banner when any violation is active */}
        {violations.length > 0 && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 md:px-6 py-3 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/15 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                    Alerta de Violación en Aula Inteligente ({violations.length} activa
                    {violations.length > 1 ? 's' : ''})
                  </div>
                  <div className="text-sm font-semibold">
                    {violations[0].sensorShort}: {violations[0].detail}
                    {violations.length > 1 && ` (+${violations.length - 1} más)`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => openDiagnosticForViolation(violations[0].id)}
                className="inline-flex items-center gap-2 bg-white text-red-700 hover:bg-amber-50 font-bold text-xs px-4 py-2 rounded-lg shadow transition-all shrink-0"
              >
                Ver Causas, Efectos y Recomendación Inmediata
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main View Router */}
        <main className="p-4 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && (
            <>
              {/* Row 1: 2 Radial Gauges + Central Status Table + 4 KPI Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Gauge 1: CO2 */}
                <div className="lg:col-span-3">
                  <RadialGauge
                    title="CO2 (MH-Z1911A)"
                    subtitle="Calidad del Aire NDIR"
                    value={co2Eval.value}
                    unit={co2Eval.unit}
                    min={350}
                    max={2000}
                    nominalMin={co2Eval.min}
                    nominalMax={co2Eval.max}
                    status={co2Eval.status}
                    severity={co2Eval.severity}
                    iconName="Wind"
                    timestamp={latest.timestamp}
                    onClick={() => openDiagnosticForViolation('mhz19')}
                  />
                </div>

                {/* Gauge 2: Temperatura */}
                <div className="lg:col-span-3">
                  <RadialGauge
                    title="Temperatura (BME280)"
                    subtitle="Prom. móvil 5 muestras (ASHRAE 55)"
                    value={tempEval.value}
                    unit={tempEval.unit}
                    min={10}
                    max={40}
                    nominalMin={tempEval.min}
                    nominalMax={tempEval.max}
                    status={tempEval.status}
                    severity={tempEval.severity}
                    iconName="Thermometer"
                    timestamp={latest.timestamp}
                    onClick={() => openDiagnosticForViolation('bme280-temperature')}
                  />
                </div>

                {/* Central State Matrix Table (like "Current Meters" in reference) */}
                <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Estado Actual de Mediciones del Aula
                      </h3>
                      <p className="text-xs text-slate-400">
                        Monitoreo continuo: estado nominal o violación de límites
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        violations.length === 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {violations.length === 0 ? 'Todo Nominal' : `${violations.length} Violación(es)`}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-800 text-slate-100">
                          <th className="py-2 px-3 rounded-tl-lg font-semibold">Variable / Sensor</th>
                          <th className="py-2 px-3 font-semibold">Medición</th>
                          <th className="py-2 px-3 font-semibold">Rango Nominal</th>
                          <th className="py-2 px-3 rounded-tr-lg font-semibold text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {evaluations.map((ev) => {
                          const isBad = ev.severity !== 'nominal';
                          return (
                            <tr
                              key={`${ev.sensorId}-${ev.variableKey}`}
                              onClick={() =>
                                openDiagnosticForViolation(`${ev.sensorId}-${ev.variableKey}`)
                              }
                              className={`cursor-pointer transition-colors ${
                                isBad ? 'bg-red-50/80 hover:bg-red-100/70' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2 px-3 font-medium text-slate-800 flex items-center gap-2">
                                <SensorIcon
                                  name={ev.icon}
                                  className="w-3.5 h-3.5 shrink-0"
                                  style={{ color: ev.color }}
                                />
                                <span>{ev.variableLabel}</span>
                                <span className="text-[10px] text-slate-400 hidden sm:inline">
                                  ({ev.sensorCode})
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                {ev.value} {ev.unit}
                              </td>
                              <td className="py-2 px-3 text-slate-500">
                                {ev.min} – {ev.max} {ev.unit}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isBad
                                      ? 'bg-red-600 text-white'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {isBad ? (
                                    <AlertTriangle className="w-3 h-3" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                  {ev.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Row 1.5: 4 KPI Cards + Humedad/Presión summary (like right-side kWh cards in reference) */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpiCards.map(({ evalItem, icon, accent }) => {
                  const isBad = evalItem.severity !== 'nominal';
                  return (
                    <div
                      key={evalItem.variableKey}
                      onClick={() =>
                        openDiagnosticForViolation(
                          `${evalItem.sensorId}-${evalItem.variableKey}`
                        )
                      }
                      className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        isBad ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 truncate">
                          {evalItem.variableLabel}
                        </span>
                        <div className={`p-1.5 rounded-lg ${accent}`}>
                          <SensorIcon name={icon} className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-2xl font-extrabold font-mono ${
                            isBad ? 'text-red-600' : 'text-slate-800'
                          }`}
                        >
                          {evalItem.value}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {evalItem.unit}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{evalItem.sensorCode}</span>
                        <span
                          className={`font-bold ${
                            isBad ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {evalItem.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Humedad KPI */}
                <div
                  onClick={() => openDiagnosticForViolation('bme280-humidity')}
                  className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    humEval.severity !== 'nominal'
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">Humedad Rel.</span>
                    <div className="p-1.5 rounded-lg text-cyan-600 bg-cyan-50">
                      <SensorIcon name="Droplets" className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-extrabold font-mono ${
                        humEval.severity !== 'nominal' ? 'text-red-600' : 'text-slate-800'
                      }`}
                    >
                      {humEval.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">BME280</span>
                    <span
                      className={`font-bold ${
                        humEval.severity !== 'nominal' ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {humEval.status}
                    </span>
                  </div>
                </div>

                {/* Presión KPI */}
                <div
                  onClick={() => openDiagnosticForViolation('bme280-pressure')}
                  className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    pressEval.severity !== 'nominal'
                      ? 'border-red-300 ring-2 ring-red-100'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">Presión Atm.</span>
                    <div className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50">
                      <SensorIcon name="Gauge" className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-extrabold font-mono ${
                        pressEval.severity !== 'nominal' ? 'text-red-600' : 'text-slate-800'
                      }`}
                    >
                      {pressEval.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">hPa</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">BME280</span>
                    <span
                      className={`font-bold ${
                        pressEval.severity !== 'nominal' ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {pressEval.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Dual Line Chart + Multi-Sensor Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DualTrendChart history={history} />
                <MultiSensorBarChart history={history} />
              </div>

              {/* Row 3: 3 Dark Telemetry Panels (like bottom of reference image) */}
              <DarkTelemetryRow history={history} />
            </>
          )}

          {activeTab === 'diagnostic' && (
            <DiagnosticView
              violations={violations}
              selectedViolationId={selectedViolationId}
              onSelectViolation={setSelectedViolationId}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'catalog' && (
            <SensorCatalogView violations={violations} />
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Simulador de Escenarios y Fallas del Aula Inteligente
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona cualquier escenario para inyectar datos simulados en tiempo real y
                  observar cómo el dashboard detecta violaciones, activa alertas y despliega los
                  grafos causales OR-AND.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {SCENARIOS.map((sc) => {
                  const active = scenarioId === sc.id;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => handleScenarioChange(sc.id)}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        active
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span
                          className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-2 ${
                            sc.id === 'nominal'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {sc.badge}
                        </span>
                        <h3 className="text-sm font-bold text-slate-800">{sc.label}</h3>
                        <p className="text-xs text-slate-500 mt-1">{sc.description}</p>
                      </div>
                      <div className="mt-4 text-xs font-semibold text-indigo-600">
                        {active ? '✓ Escenario Activo' : 'Activar simulación →'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
