import React from 'react';
import SensorIcon from '../common/SensorIcon';

function buildPath(points, width, height, padX, padY, minVal, maxVal) {
  if (!points.length) return '';
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  return points
    .map((rawVal, idx) => {
      const val = rawVal === null || rawVal === undefined ? minVal : Number(rawVal);
      const x = padX + (idx / Math.max(1, points.length - 1)) * innerW;
      const clamped = Math.min(maxVal, Math.max(minVal, val));
      const y = padY + innerH - ((clamped - minVal) / Math.max(0.001, maxVal - minVal)) * innerH;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function DualTrendChart({ history }) {
  const w = 520;
  const h = 190;
  const padX = 40;
  const padY = 18;

  const co2Vals = history.map((d) => d.co2_ppm ?? 400);
  const tempVals = history.map((d) => d.temp_c ?? 22);

  const co2Path = buildPath(co2Vals, w, h, padX, padY, 300, 1800);
  const tempPath = buildPath(tempVals, w, h, padX, padY, 15, 35);

  const thresholdCo2Y =
    padY + (h - padY * 2) - ((1000 - 300) / (1800 - 300)) * (h - padY * 2);

  return (
    <div className="bg-white rounded-2xl border-t-4 border-t-indigo-600 border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <SensorIcon name="Wind" className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Evolución de Calidad de Aire y Clima en Clase
            </h3>
            <p className="text-xs text-slate-500">
              Línea roja: límite sugerido de ventilación (1,000 ppm de CO₂)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-1 bg-indigo-600 inline-block rounded-full" /> Aire CO₂ (ppm)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-1 bg-emerald-500 inline-block rounded-full" /> Temperatura (°C)
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padY + t * (h - padY * 2);
          const co2Label = Math.round(1800 - t * (1800 - 300));
          const tempLabel = (35 - t * (35 - 15)).toFixed(0);
          return (
            <g key={i}>
              <line
                x1={padX}
                y1={y}
                x2={w - padX}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="3 3"
              />
              <text x={padX - 8} y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
                {co2Label}
              </text>
              <text x={w - padX + 8} y={y + 3} fontSize="9" fill="#10b981" textAnchor="start">
                {tempLabel}°
              </text>
            </g>
          );
        })}

        <line
          x1={padX}
          y1={thresholdCo2Y}
          x2={w - padX}
          y2={thresholdCo2Y}
          stroke="#f43f5e"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        <path d={co2Path} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={tempPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="text-center text-[11px] text-slate-400 mt-1">
        Tendencia continua a lo largo de la clase
      </div>
    </div>
  );
}

export function MultiSensorBarChart({ history }) {
  const slice = history.slice(-10);
  const w = 520;
  const h = 190;
  const padX = 36;
  const padY = 18;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  return (
    <div className="bg-white rounded-2xl border-t-4 border-t-amber-500 border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
            <SensorIcon name="Sun" className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Balance de Luz, Silencio y Humedad
            </h3>
            <p className="text-xs text-slate-500">
              Factores que facilitan el trabajo individual y grupal sin distracciones
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block" /> Luz (lux/5)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-violet-500 rounded-sm inline-block" /> Humedad (%)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm inline-block" /> Ruido (dB)
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = padY + t * innerH;
          const label = Math.round(120 - t * 120);
          return (
            <g key={i}>
              <line
                x1={padX}
                y1={y}
                x2={w - padX}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="3 3"
              />
              <text x={padX - 8} y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
                {label}
              </text>
            </g>
          );
        })}

        {slice.map((item, idx) => {
          const groupW = innerW / Math.max(1, slice.length);
          const gx = padX + idx * groupW + groupW * 0.15;
          const barW = (groupW * 0.7) / 3;

          const vals = [
            { v: Math.min(120, (item.lux_mesa_est ?? 0) / 5), color: '#f59e0b' },
            { v: Math.min(120, item.hum_pct ?? 0), color: '#8b5cf6' },
            { v: Math.min(120, item.leq_db ?? 0), color: '#f43f5e' },
          ];

          return (
            <g key={idx}>
              {vals.map((b, bi) => {
                const bh = (Math.max(0, b.v) / 120) * innerH;
                const by = padY + innerH - bh;
                return (
                  <rect
                    key={bi}
                    x={gx + bi * (barW + 1.5)}
                    y={by}
                    width={Math.max(4, barW)}
                    height={bh}
                    rx="2"
                    fill={b.color}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="text-center text-[11px] text-slate-400 mt-1">
        Mediciones recientes de bienestar en el salón
      </div>
    </div>
  );
}

export function LightTelemetryRow({ history }) {
  const panels = [
    {
      title: 'Calidad del Aire y Seguridad',
      subtitle: 'Concentración de CO₂ y ausencia de humo/gases',
      icon: 'Flame',
      series: [
        {
          label: 'Aire CO₂ / 10',
          color: '#0284c7',
          vals: history.map((d) => (d.co2_ppm ?? 0) / 10),
          min: 0,
          max: 200,
        },
        {
          label: 'Seguridad Gases',
          color: '#f43f5e',
          vals: history.map((d) => (d.rs_r0 ?? 1) * 100),
          min: 0,
          max: 150,
        },
      ],
    },
    {
      title: 'Aforo y Circulación en el Aula',
      subtitle: 'Alumnos presentes y estado de la puerta',
      icon: 'Users',
      series: [
        {
          label: 'Alumnos en Aula',
          color: '#6366f1',
          vals: history.map((d) => d.ocupacion_est ?? 0),
          min: 0,
          max: 50,
        },
        {
          label: 'Puerta Abierta (s)',
          color: '#a855f7',
          vals: history.map((d) => d.seg_abierta ?? 0),
          min: 0,
          max: 300,
        },
      ],
    },
    {
      title: 'Confort Acústico, Luz y Térmico',
      subtitle: 'Condiciones de estudio para el aprendizaje',
      icon: 'Activity',
      series: [
        {
          label: 'Ruido (dB)',
          color: '#ec4899',
          vals: history.map((d) => d.leq_db ?? 0),
          min: 20,
          max: 100,
        },
        {
          label: 'Luz (lux/10)',
          color: '#f59e0b',
          vals: history.map((d) => (d.lux ?? 0) / 10),
          min: 0,
          max: 100,
        },
        {
          label: 'Temp (°C)',
          color: '#10b981',
          vals: history.map((d) => d.temp_c ?? 0),
          min: 10,
          max: 40,
        },
      ],
    },
  ];

  const w = 340;
  const h = 120;
  const padX = 24;
  const padY = 12;

  const panelThemes = [
    {
      cardBg: 'bg-white border-sky-200 hover:border-sky-400',
      iconBg: 'bg-sky-500 text-white',
    },
    {
      cardBg: 'bg-white border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-600 text-white',
    },
    {
      cardBg: 'bg-white border-emerald-200 hover:border-emerald-400',
      iconBg: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {panels.map((panel, idx) => {
        const theme = panelThemes[idx] || panelThemes[0];
        return (
          <div
            key={idx}
            className={`rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${theme.cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{panel.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{panel.subtitle}</p>
              </div>
              <div className={`p-2 rounded-xl shadow-2xs ${theme.iconBg}`}>
                <SensorIcon name={panel.icon} className="w-4 h-4" />
              </div>
            </div>

            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
              {[0, 0.5, 1].map((t, gi) => {
                const y = padY + t * (h - padY * 2);
                return (
                  <line
                    key={gi}
                    x1={padX}
                    y1={y}
                    x2={w - 10}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                );
              })}
              {panel.series.map((s, si) => (
                <path
                  key={si}
                  d={buildPath(s.vals, w, h, padX, padY, s.min, s.max)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            <div className="flex flex-wrap items-center gap-3 mt-1 pt-2.5 border-t border-slate-200/60 text-[11px]">
              {panel.series.map((s, si) => (
                <span key={si} className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}:{' '}
                  <strong className="font-mono text-slate-900">
                    {s.vals[s.vals.length - 1]?.toFixed(1)}
                  </strong>
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
