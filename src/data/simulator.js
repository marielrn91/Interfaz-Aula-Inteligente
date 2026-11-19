import { SENSORS_CATALOG } from './sensorsCatalog';

function jitter(base, variance, decimals = 1) {
  const val = base + (Math.random() - 0.5) * 2 * variance;
  return Number(val.toFixed(decimals));
}

export function generateReadingForScenario(scenarioId) {
  const base = {
    co2: 640,
    hallMag: 0.48,
    temperature: 22.8,
    humidity: 49.0,
    pressure: 1013.25,
    lux: 78,
    noise: 42.0,
    gasPpm: 65,
  };

  switch (scenarioId) {
    case 'co2_alert':
      base.co2 = 1220;
      break;
    case 'co2_critical':
      base.co2 = 1640;
      break;
    case 'hall_alert':
      base.hallMag = 12.4;
      break;
    case 'temp_high':
      base.temperature = 28.4;
      break;
    case 'temp_low':
      base.temperature = 17.8;
      break;
    case 'humidity_alert':
      base.humidity = 68.5;
      break;
    case 'pressure_alert':
      base.pressure = 1026.8;
      break;
    case 'lux_alert':
      base.lux = 245;
      break;
    case 'noise_alert':
      base.noise = 78.5;
      break;
    case 'gas_alert':
      base.gasPpm = 420;
      break;
    case 'gas_critical':
      base.gasPpm = 1180;
      break;
    default:
      break;
  }

  return {
    timestamp: new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    co2: Math.round(jitter(base.co2, 16, 0)),
    hallMag: Math.max(0.1, jitter(base.hallMag, 0.08, 2)),
    temperature: jitter(base.temperature, 0.2, 1),
    humidity: Math.min(100, Math.max(0, jitter(base.humidity, 0.7, 1))),
    pressure: jitter(base.pressure, 0.35, 2),
    lux: Math.max(1, Math.round(jitter(base.lux, 6, 0))),
    noise: Math.max(20, jitter(base.noise, 1.5, 1)),
    gasPpm: Math.max(0, Math.round(jitter(base.gasPpm, 12, 0))),
  };
}

export function evaluateStates(history) {
  const latest = history[history.length - 1];
  const last5 = history.slice(-5);
  const tempMovingAvg5 = Number(
    (last5.reduce((acc, item) => acc + item.temperature, 0) / last5.length).toFixed(1)
  );

  const evaluations = [];
  const violations = [];

  SENSORS_CATALOG.forEach((sensor) => {
    sensor.variables.forEach((variable) => {
      const rawValue = latest[variable.key];
      const evaluatedValue =
        variable.key === 'temperature' ? tempMovingAvg5 : rawValue;

      let status = 'NOMINAL';
      let severity = 'nominal';
      let detail = `Dentro de estándar (${variable.min} – ${variable.max} ${variable.unit})`;

      const tooHigh = evaluatedValue > variable.max;
      const tooLow = evaluatedValue < variable.min;
      const isCritical =
        (variable.criticalMax !== undefined && evaluatedValue >= variable.criticalMax) ||
        (variable.criticalMin !== undefined && evaluatedValue <= variable.criticalMin);

      if (tooHigh || tooLow) {
        status = isCritical ? 'CRÍTICA' : 'ALERTA';
        severity = isCritical ? 'critical' : 'warning';
        detail = tooHigh
          ? `Excede estándar: ${evaluatedValue} ${variable.unit} (Máx: ${variable.max} ${variable.unit})`
          : `Bajo estándar: ${evaluatedValue} ${variable.unit} (Mín: ${variable.min} ${variable.unit})`;

        violations.push({
          id: `${sensor.id}-${variable.key}`,
          sensorId: sensor.id,
          sensorName: sensor.name,
          sensorShort: sensor.shortName,
          sensorCode: sensor.code,
          sku: sensor.sku,
          variableKey: variable.key,
          variableLabel: variable.label,
          value: evaluatedValue,
          rawValue,
          unit: variable.unit,
          min: variable.min,
          max: variable.max,
          referenceNote: variable.referenceNote,
          severity,
          status,
          detail,
          timestamp: latest.timestamp,
          diagnostic: variable.diagnostic,
          icon: sensor.icon,
          color: sensor.color,
        });
      }

      evaluations.push({
        sensorId: sensor.id,
        sensorShort: sensor.shortName,
        sensorCode: sensor.code,
        location: sensor.location,
        variableKey: variable.key,
        variableLabel: variable.label,
        value: evaluatedValue,
        rawValue,
        unit: variable.unit,
        min: variable.min,
        max: variable.max,
        referenceNote: variable.referenceNote,
        status,
        severity,
        detail,
        icon: sensor.icon,
        color: sensor.color,
      });
    });
  });

  return { evaluations, violations, tempMovingAvg5 };
}

export function createInitialHistory(scenarioId = 'nominal', count = 16) {
  const list = [];
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const r = generateReadingForScenario(scenarioId);
    const t = new Date(now - i * 4000);
    r.timestamp = t.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    list.push(r);
  }
  return list;
}
