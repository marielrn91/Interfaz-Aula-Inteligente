import React from 'react';
import { WifiOff, PlayCircle, Volume2, Sun, ArrowRight } from 'lucide-react';
import RadialGauge from '../charts/RadialGauge';
import {
  DualTrendChart,
  MultiSensorBarChart,
  LightTelemetryRow,
} from '../charts/TelemetryCharts';

export default function OverviewDashboard({
  history,
  evaluations,
  connectionMode,
  onSwitchToSimulator,
  gatewayOnline,
  onOpenDiagnostic,
}) {
  const latest = history[history.length - 1] || {};
  const getEval = (key) => evaluations.find((e) => e.variableKey === key) || {};

  const co2Eval = getEval('co2_ppm');
  const tempEval = getEval('temp_c');

  const co2LevelLabel =
    latest.co2_ppm >= 1500
      ? 'Crítico · Ventilar urgente'
      : latest.co2_ppm >= 1000
      ? 'Atención · Abrir ventanas'
      : 'Aire fresco y saludable';

  const tempLevelLabel =
    latest.temp_c > 26
      ? 'Ambiente cálido · Regular clima'
      : latest.temp_c < 20
      ? 'Ambiente fresco'
      : 'Confort térmico ideal para estudiar';

  const noiseVal = latest.leq_db ?? 47.3;
  const isNoiseAlert = noiseVal > 65;

  const lightVal = latest.lux ?? 451.1;
  const isLightAlert = lightVal < 300 || lightVal > 750;

  return (
    <div className="space-y-6">
      {/* Aviso si está en modo Wi-Fi y esperando conexión */}
      {connectionMode !== 'simulator' && !gatewayOnline && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
                Esperando datos desde el Gateway Wi-Fi
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                Asegúrate de que tu computadora esté conectada a la red Wi-Fi <strong>GEMELO-L419</strong>. También puedes usar el <strong>Simulador de Datos</strong> para interactuar de inmediato.
              </p>
            </div>
          </div>
          <button
            onClick={onSwitchToSimulator}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-950/20"
          >
            <PlayCircle className="w-4 h-4" />
            Activar Simulación de Datos
          </button>
        </div>
      )}

      {/* Fila 1: 4 Tarjetas de Confort Estudiantil Visuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Medidor de Calidad del Aire (CO2) */}
        <RadialGauge
          title="Calidad del Aire (CO₂)"
          subtitle={co2LevelLabel}
          value={co2Eval.value}
          displayText={co2Eval.displayValue}
          unit={co2Eval.unit || 'ppm'}
          min={350}
          max={2000}
          nominalMin={co2Eval.min ?? 400}
          nominalMax={co2Eval.max ?? 1000}
          status={co2Eval.status || 'En espera'}
          severity={co2Eval.severity || 'nominal'}
          iconName="Wind"
          extraBadge={
            latest.calentando === 1
              ? 'Sensor en estabilización inicial'
              : co2Eval.severity === 'nominal'
              ? 'Aire Fresco y Saludable'
              : 'Ventilación Requerida'
          }
          onClick={() => onOpenDiagnostic('nodo-1-co2')}
        />

        {/* 2. Medidor de Clima y Temperatura */}
        <RadialGauge
          title="Sensación Térmica"
          subtitle={tempLevelLabel}
          value={tempEval.value}
          displayText={tempEval.displayValue}
          unit={tempEval.unit || '°C'}
          min={10}
          max={40}
          nominalMin={tempEval.min ?? 20}
          nominalMax={tempEval.max ?? 26}
          status={tempEval.status || 'En espera'}
          severity={tempEval.severity || 'nominal'}
          iconName="Thermometer"
          extraBadge={
            tempEval.severity === 'nominal'
              ? 'Clima Agradable para Clases'
              : 'Fuera de Rango Confortable'
          }
          onClick={() => onOpenDiagnostic('nodo-7-ambiente')}
        />

        {/* 3. Tarjeta Visual Colorida de Confort Acústico (Ruido) */}
        <div
          onClick={() => onOpenDiagnostic('nodo-2-audio')}
          className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between cursor-pointer group ${
            isNoiseAlert
              ? 'border-rose-400 ring-2 ring-rose-200 hover:shadow-lg'
              : 'border-rose-100 hover:border-rose-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl shadow-xs ${
                    isNoiseAlert
                      ? 'bg-red-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Confort Acústico
                  </h3>
                  <p className="text-xs text-rose-700 font-medium mt-0.5">Silencio y claridad</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  isNoiseAlert
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {isNoiseAlert ? 'Ruido Alto' : 'Ideal'}
              </span>
            </div>

            <div className="my-4 text-center bg-rose-50 p-3 rounded-xl border border-rose-100">
              <div className="text-3xl font-black font-mono text-slate-900">
                {noiseVal} <span className="text-xs font-bold text-slate-500">dB</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Rango propicio: hasta 65 dB en clase
              </p>
              {/* Barra visual de nivel */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isNoiseAlert
                      ? 'bg-rose-600'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (noiseVal / 90) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100">
            <span className="font-medium text-slate-600">
              {isNoiseAlert ? 'Interferencia sonora' : 'Ambiente tranquilo'}
            </span>
            <span className="text-rose-600 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Detalles <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 4. Tarjeta Visual Colorida de Iluminación de Estudio */}
        <div
          onClick={() => onOpenDiagnostic('nodo-4-luz')}
          className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between cursor-pointer group ${
            isLightAlert
              ? 'border-amber-400 ring-2 ring-amber-200 hover:shadow-lg'
              : 'border-amber-100 hover:border-amber-300 hover:shadow-md'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl shadow-xs ${
                    isLightAlert
                      ? 'bg-orange-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    Iluminación
                  </h3>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">Confort visual en mesas</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  isLightAlert
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {isLightAlert ? 'Luz Inadecuada' : 'Ideal'}
              </span>
            </div>

            <div className="my-4 text-center bg-amber-50 p-3 rounded-xl border border-amber-100">
              <div className="text-3xl font-black font-mono text-slate-900">
                {lightVal} <span className="text-xs font-bold text-slate-500">lux</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Rango recomendado: 300 – 750 lux
              </p>
              {/* Barra visual de nivel */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLightAlert
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (lightVal / 800) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2.5 border-t border-slate-100">
            <span className="font-medium text-slate-600">
              {isLightAlert ? 'Ajustar luminarias' : 'Buena visibilidad'}
            </span>
            <span className="text-amber-700 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Detalles <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Fila 3: Gráficas de Tendencia Histórica con Bordes Coloridos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DualTrendChart history={history} />
        <MultiSensorBarChart history={history} />
      </div>

      {/* Fila 4: Monitoreo Integral de Todas las Variables con Diseños Atractivos */}
      <LightTelemetryRow history={history} />
    </div>
  );
}
