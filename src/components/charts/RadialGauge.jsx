import React from 'react';
import SensorIcon from '../common/SensorIcon';

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export default function RadialGauge({
  title,
  subtitle,
  value,
  displayText,
  unit,
  min,
  max,
  nominalMin,
  nominalMax,
  status,
  severity,
  iconName,
  timestamp,
  extraBadge,
  onClick,
}) {
  const isEmpty = value === null || value === undefined || value === 'null';
  const numericValue = isEmpty ? min : Number(value);
  const clamped = Math.min(max, Math.max(min, numericValue));
  const startAngle = -125;
  const endAngle = 125;
  const totalSpan = endAngle - startAngle;

  const valToAngle = (v) => startAngle + ((v - min) / (max - min)) * totalSpan;

  const nomStartAngle = valToAngle(Math.max(min, nominalMin));
  const nomEndAngle = valToAngle(Math.min(max, nominalMax));
  const needleAngle = valToAngle(clamped);

  const cx = 100;
  const cy = 96;
  const radius = 70;

  const isViolation = severity !== 'nominal';
  const needleTip = polarToCartesian(cx, cy, radius - 10, needleAngle);

  const statusColors =
    status === 'SIN DATOS'
      ? 'bg-slate-100 text-slate-600 border-slate-200'
      : severity === 'critical'
      ? 'bg-red-100 text-red-700 border-red-200'
      : severity === 'warning'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 shadow-sm transition-all flex flex-col justify-between ${
        isViolation
          ? 'border-red-300 ring-2 ring-red-100 cursor-pointer hover:shadow-md'
          : 'border-slate-200 hover:border-slate-300 cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${
              isViolation ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <SensorIcon name={iconName} className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 leading-tight">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${statusColors}`}
        >
          {status}
        </span>
      </div>

      <div className="flex flex-col items-center my-1">
        <svg viewBox="0 0 200 150" className="w-full max-w-[195px] overflow-visible">
          {/* Background track */}
          <path
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Low violation zone */}
          {nomStartAngle > startAngle && (
            <path
              d={describeArc(cx, cy, radius, startAngle, nomStartAngle)}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="12"
              strokeLinecap="round"
            />
          )}
          {/* High violation zone */}
          {nomEndAngle < endAngle && (
            <path
              d={describeArc(cx, cy, radius, nomEndAngle, endAngle)}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="12"
              strokeLinecap="round"
            />
          )}
          {/* Nominal green zone */}
          <path
            d={describeArc(cx, cy, radius, nomStartAngle, nomEndAngle)}
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeLinecap="butt"
          />

          {/* Needle only rendered when there is an actual numeric value */}
          {!isEmpty && (
            <line
              x1={cx}
              y1={cy}
              x2={needleTip.x}
              y2={needleTip.y}
              stroke={isViolation ? '#dc2626' : '#1e293b'}
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
          <circle cx={cx} cy={cy} r="6" fill={isViolation ? '#dc2626' : '#1e293b'} />
          <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />

          {/* Min / Max labels */}
          <text x="32" y="138" fontSize="10" fill="#64748b" textAnchor="middle">
            {min}
          </text>
          <text x="168" y="138" fontSize="10" fill="#64748b" textAnchor="middle">
            {max}
          </text>
        </svg>

        <div className="-mt-4 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`text-2xl font-extrabold font-mono tracking-tight ${
                isViolation
                  ? 'text-red-600'
                  : isEmpty
                  ? 'text-slate-400'
                  : 'text-slate-800'
              }`}
            >
              {displayText !== undefined ? displayText : isEmpty ? '--' : value}
            </span>
            {!isEmpty && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Nominal: {nominalMin} – {nominalMax} {unit}
          </p>
          {extraBadge && (
            <div className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {extraBadge}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span>ts: {timestamp}</span>
        {isViolation && (
          <span className="text-red-600 font-semibold hover:underline">Ver diagnóstico →</span>
        )}
      </div>
    </div>
  );
}
