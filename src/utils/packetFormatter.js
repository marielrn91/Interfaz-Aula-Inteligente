import { NODES_CATALOG, GATEWAY_CONFIG } from '../data/nodesCatalog';

/**
 * Formatea la marca de tiempo a hora legible HH:MM:SS.
 */
export function formatEpochTimestamp(ts, gwMs = null) {
  if (ts !== null && ts !== undefined && !Number.isNaN(Number(ts)) && Number(ts) > 0) {
    try {
      return new Date(Number(ts)).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      // fallback
    }
  }
  if (gwMs !== null && gwMs !== undefined) {
    const sec = Math.floor(Number(gwMs) / 1000);
    return `+${sec}s`;
  }
  return 'En espera';
}

/**
 * Traduce códigos de anomalía técnicos a texto claro en español.
 */
export function translateAnomalyName(code) {
  const map = {
    NINGUNA: 'Óptimo',
    CO2_CRITICO: 'CO₂ Crítico',
    CO2_ALERTA_VENTILACION: 'Alerta de Ventilación',
    CO2_PICO_RAPIDO: 'Subida Brusca de CO₂',
    RUIDO_FUERTE_SOSTENIDO: 'Ruido Excesivo',
    RUIDO_IMPACTO: 'Impacto Sonoro',
    RUIDO_MECANICO_CONSTANTE: 'Ruido Mecánico Continuo',
    GAS_DETECTADO: 'Humo / Gas Detectado',
    PICO_RAPIDO_GAS: 'Presencia Rápida de Gas',
    ILUMINACION_BAJA: 'Iluminación Baja',
    ILUMINACION_EXCESIVA: 'Iluminación Excesiva',
    OBJETO_ESTATICO: 'Obstrucción en Puerta',
    CONTEO_CORREGIDO: 'Aforo Actualizado',
    PUERTA_ABIERTA_PROLONGADA: 'Puerta Abierta > 10 min',
    TEMP_FUERA_CONFORT: 'Temperatura Fuera de Confort',
    HUMEDAD_ALTA: 'Humedad Excesiva',
    CAMBIO_RAPIDO_TEMP: 'Cambio Rápido Térmico',
    FALLO_SENSOR: 'Falla de Sensor',
    FALLO_AUDIO: 'Falla de Micrófono',
  };
  return map[code] || code;
}

/**
 * Normaliza la lista de anomalías que viene en el campo anomalias.
 */
export function parseAnomaliesString(anomaliasStr) {
  if (!anomaliasStr || typeof anomaliasStr !== 'string') return [];
  return anomaliasStr
    .split(/[,;|]+/)
    .map((s) => s.trim())
    .filter((s) => s && s.toUpperCase() !== 'NINGUNA');
}

/**
 * Convierte el arreglo devuelto por /api/ultimos en un snapshot limpio.
 */
export function formatUltimosToSnapshot(ultimosList = []) {
  const byTipo = {};
  const byNodo = {};
  let latestTs = null;
  let latestGwMs = null;
  let maxMsgId = 0;

  for (const item of ultimosList) {
    if (!item) continue;
    const msg = item.msg || item;
    const tipo = item.tipo || msg.tipo;
    const nodo = item.nodo || msg.nodo;
    const hace_s = item.hace_s ?? null;
    const anomalias = item.anomalias || msg.anomalias || 'NINGUNA';

    const normalized = {
      nodo,
      tipo,
      hace_s,
      anomalias,
      hasData: true,
      isOffline: hace_s !== null && hace_s > GATEWAY_CONFIG.disconnectThresholdSec,
      msg,
    };

    if (tipo) byTipo[tipo] = normalized;
    if (nodo) byNodo[nodo] = normalized;

    if (msg?.ts && (!latestTs || msg.ts > latestTs)) {
      latestTs = msg.ts;
    }
    if (msg?.gw_ms && (!latestGwMs || msg.gw_ms > latestGwMs)) {
      latestGwMs = msg.gw_ms;
    }
    if (msg?.id && msg.id > maxMsgId) {
      maxMsgId = msg.id;
    }
  }

  const co2Msg = byTipo.co2?.msg || {};
  const audioMsg = byTipo.audio?.msg || {};
  const gasMsg = byTipo.gas?.msg || {};
  const luzMsg = byTipo.luz?.msg || {};
  const termicoMsg = byTipo.termico?.msg || {};
  const magneticoMsg = byTipo.magnetico?.msg || {};
  const ambienteMsg = byTipo.ambiente?.msg || {};

  return {
    ts: latestTs,
    gw_ms: latestGwMs,
    timestamp: formatEpochTimestamp(latestTs, latestGwMs),
    maxMsgId,
    byTipo,
    byNodo,
    // Nodo 1 - CO2
    co2_ppm: co2Msg.co2_ppm ?? null,
    delta_30s: co2Msg.delta_30s ?? null,
    co2_temp_c: co2Msg.temp_c ?? null,
    calentando: co2Msg.calentando ?? null,
    nivel: co2Msg.nivel ?? null,
    // Nodo 2 - Audio
    leq_db: audioMsg.leq_db ?? null,
    lmax_db: audioMsg.lmax_db ?? null,
    pico_db: audioMsg.pico_db ?? null,
    base_db: audioMsg.base_db ?? null,
    // Nodo 3 - Gas
    rs_r0: gasMsg.rs_r0 ?? null,
    do_alarma: gasMsg.do_alarma ?? null,
    // Nodo 4 - Luz
    lux: luzMsg.lux ?? null,
    lux_min: luzMsg.lux_min ?? null,
    lux_max: luzMsg.lux_max ?? null,
    lux_mesa_est: luzMsg.lux_mesa_est ?? null,
    luces_cambio: luzMsg.luces_cambio ?? null,
    // Nodo 5 - Aforo / Térmico
    ocupacion_est: termicoMsg.ocupacion_est ?? null,
    entradas: termicoMsg.entradas ?? null,
    salidas: termicoMsg.salidas ?? null,
    // Nodo 6 - Puerta / Magnético
    puerta_abierta: magneticoMsg.puerta_abierta ?? null,
    aperturas: magneticoMsg.aperturas ?? null,
    seg_abierta: magneticoMsg.seg_abierta ?? null,
    campo_raw: magneticoMsg.campo_raw ?? null,
    // Nodo 7 - Ambiente
    temp_c: ambienteMsg.temp_c ?? null,
    hum_pct: ambienteMsg.hum_pct ?? null,
    pres_hpa: ambienteMsg.pres_hpa ?? null,
  };
}

/**
 * Integra la lista de mensajes incrementales para el historial de gráficas.
 */
export function mergeMessagesIntoSnapshots(prevSnapshots = [], nuevosMensajes = [], maxPoints = 30) {
  if (!nuevosMensajes || nuevosMensajes.length === 0) return prevSnapshots;

  const baseLast = prevSnapshots[prevSnapshots.length - 1] || {
    co2_ppm: null,
    delta_30s: null,
    calentando: null,
    nivel: null,
    leq_db: null,
    lmax_db: null,
    pico_db: null,
    base_db: null,
    rs_r0: null,
    do_alarma: null,
    lux: null,
    lux_min: null,
    lux_max: null,
    lux_mesa_est: null,
    luces_cambio: null,
    ocupacion_est: null,
    entradas: null,
    salidas: null,
    puerta_abierta: null,
    aperturas: null,
    seg_abierta: null,
    campo_raw: null,
    temp_c: null,
    hum_pct: null,
    pres_hpa: null,
  };

  let working = { ...baseLast };
  const generated = [];

  nuevosMensajes.forEach((m) => {
    if (!m || typeof m !== 'object') return;
    if (m.tipo === 'co2') {
      working.co2_ppm = m.co2_ppm ?? working.co2_ppm;
      working.delta_30s = m.delta_30s ?? working.delta_30s;
      working.calentando = m.calentando ?? working.calentando;
      working.nivel = m.nivel ?? working.nivel;
    } else if (m.tipo === 'audio') {
      working.leq_db = m.leq_db ?? working.leq_db;
      working.lmax_db = m.lmax_db ?? working.lmax_db;
      working.pico_db = m.pico_db ?? working.pico_db;
      working.base_db = m.base_db ?? working.base_db;
    } else if (m.tipo === 'gas') {
      working.rs_r0 = m.rs_r0 ?? working.rs_r0;
      working.do_alarma = m.do_alarma ?? working.do_alarma;
    } else if (m.tipo === 'luz') {
      working.lux = m.lux ?? working.lux;
      working.lux_min = m.lux_min ?? working.lux_min;
      working.lux_max = m.lux_max ?? working.lux_max;
      working.lux_mesa_est = m.lux_mesa_est ?? working.lux_mesa_est;
      working.luces_cambio = m.luces_cambio ?? working.luces_cambio;
    } else if (m.tipo === 'termico') {
      working.ocupacion_est = m.ocupacion_est ?? working.ocupacion_est;
      working.entradas = m.entradas ?? working.entradas;
      working.salidas = m.salidas ?? working.salidas;
    } else if (m.tipo === 'magnetico') {
      working.puerta_abierta = m.puerta_abierta ?? working.puerta_abierta;
      working.aperturas = m.aperturas ?? working.aperturas;
      working.seg_abierta = m.seg_abierta ?? working.seg_abierta;
      working.campo_raw = m.campo_raw ?? working.campo_raw;
    } else if (m.tipo === 'ambiente') {
      working.temp_c = m.temp_c ?? working.temp_c;
      working.hum_pct = m.hum_pct ?? working.hum_pct;
      working.pres_hpa = m.pres_hpa ?? working.pres_hpa;
    }

    working.ts = m.ts ?? working.ts;
    working.gw_ms = m.gw_ms ?? working.gw_ms;
    working.timestamp = formatEpochTimestamp(m.ts, m.gw_ms);
    working.maxMsgId = Math.max(working.maxMsgId || 0, m.id || 0);

    generated.push({ ...working });
  });

  return [...prevSnapshots, ...generated].slice(-maxPoints);
}

/**
 * Evalúa el estado de los 7 nodos sensores del aula con nombres claros y en español.
 */
export function evaluateGatewayState(history = [], latestUltimos = []) {
  const latestSnapshot = formatUltimosToSnapshot(latestUltimos);
  const byTipo = latestSnapshot.byTipo || {};

  // Promedio móvil de 5 muestras para temperatura ambiental
  const validTempSamples = history
    .slice(-5)
    .map((h) => h?.temp_c)
    .filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v)));
  const tempMovingAvg5 =
    validTempSamples.length > 0
      ? Number(
          (
            validTempSamples.reduce((acc, v) => acc + Number(v), 0) /
            validTempSamples.length
          ).toFixed(1)
        )
      : null;

  const evaluations = [];
  const violations = [];
  const nodeStatuses = [];

  NODES_CATALOG.forEach((nodeMeta) => {
    const packetWrapper = byTipo[nodeMeta.tipo] || null;
    const hasReceivedPacket = Boolean(packetWrapper && packetWrapper.hasData);

    const msg = packetWrapper?.msg || {};
    const hace_s = packetWrapper?.hace_s ?? null;
    const isOffline =
      hasReceivedPacket &&
      hace_s !== null &&
      hace_s > GATEWAY_CONFIG.disconnectThresholdSec;
    const rawAnomStr = hasReceivedPacket
      ? packetWrapper.anomalias || msg.anomalias || 'NINGUNA'
      : 'SIN_DATOS';
    const activeAnomalies = hasReceivedPacket ? parseAnomaliesString(rawAnomStr) : [];
    const hasHardwareFault = activeAnomalies.some(
      (a) => a === 'FALLO_SENSOR' || a === 'FALLO_AUDIO'
    );

    let nodeOverallStatus = hasReceivedPacket ? 'Óptimo' : 'Esperando datos';
    let nodeOverallSeverity = 'nominal';

    nodeMeta.variables.forEach((variable) => {
      const rawValue = hasReceivedPacket ? msg[variable.key] : undefined;
      const isNullReading = rawValue === null || rawValue === undefined;
      const evaluatedValue =
        !isNullReading && variable.key === 'temp_c' && tempMovingAvg5 !== null
          ? tempMovingAvg5
          : rawValue;

      let status = hasReceivedPacket ? 'Óptimo' : 'Esperando';
      let severity = 'nominal';
      let detail = hasReceivedPacket
        ? `Dentro del rango recomendado (${variable.min} – ${variable.max} ${variable.unit})`
        : 'Esperando recepción de lecturas del sensor...';

      if (hasReceivedPacket) {
        const tooHigh = !isNullReading && evaluatedValue > variable.max;
        const tooLow = !isNullReading && evaluatedValue < variable.min;
        const isCriticalValue =
          !isNullReading &&
          ((variable.criticalMax !== undefined && evaluatedValue >= variable.criticalMax) ||
            (variable.criticalMin !== undefined && evaluatedValue <= variable.criticalMin));

        const isWarmingUp = nodeMeta.tipo === 'co2' && msg.calentando === 1;
        const isGasAlarm = nodeMeta.tipo === 'gas' && msg.do_alarma === 1;

        const matchingAnomalies = activeAnomalies.filter((a) => {
          if (nodeMeta.variables.length === 1) return true;
          if (variable.key === 'temp_c') return a.includes('TEMP') || a.includes('FALLO');
          if (variable.key === 'hum_pct') return a.includes('HUMEDAD') || a.includes('FALLO');
          if (variable.key === 'pres_hpa') return a.includes('PRESION') || a.includes('FALLO');
          return true;
        });

        if (isOffline) {
          status = 'Desconectado';
          severity = 'critical';
          detail = `Sin datos recientes (${hace_s}s sin señal). Sensor apagado o fuera de alcance.`;
        } else if (hasHardwareFault || isNullReading) {
          status = 'Falla de Sensor';
          severity = 'critical';
          detail = 'Lectura nula o fallo de comunicación física detectado en el sensor.';
        } else if (isWarmingUp) {
          status = 'Estabilizando';
          severity = 'warning';
          detail = 'El sensor de CO₂ se encuentra en su fase inicial de precalentamiento (3 min).';
        } else if (isGasAlarm || matchingAnomalies.includes('GAS_DETECTADO')) {
          status = 'Alarma de Gas / Humo';
          severity = 'critical';
          detail = 'Presencia anormal de humo o gases detectada en el aula.';
        } else if (matchingAnomalies.length > 0) {
          const isCritAnom = matchingAnomalies.some((a) =>
            ['CO2_CRITICO', 'GAS_DETECTADO', 'RUIDO_FUERTE_SOSTENIDO'].includes(a)
          );
          const translatedList = matchingAnomalies.map(translateAnomalyName).join(', ');
          status = translatedList;
          severity = isCritAnom || isCriticalValue ? 'critical' : 'warning';
          detail = `Alerta detectada: ${translatedList} (Valor actual: ${evaluatedValue} ${variable.unit})`;
        } else if (tooHigh || tooLow) {
          status = isCriticalValue ? 'Crítico' : 'Alerta';
          severity = isCriticalValue ? 'critical' : 'warning';
          detail = tooHigh
            ? `Por encima del rango recomendado: ${evaluatedValue} ${variable.unit} (Máximo sugerido: ${variable.max} ${variable.unit})`
            : `Por debajo del rango recomendado: ${evaluatedValue} ${variable.unit} (Mínimo sugerido: ${variable.min} ${variable.unit})`;
        }

        if (severity === 'critical') {
          nodeOverallSeverity = 'critical';
          nodeOverallStatus = status;
        } else if (severity === 'warning' && nodeOverallSeverity !== 'critical') {
          nodeOverallSeverity = 'warning';
          nodeOverallStatus = status;
        }

        if (severity !== 'nominal' && !isWarmingUp) {
          violations.push({
            id: `${nodeMeta.id}-${variable.key}`,
            nodo: nodeMeta.nodo,
            tipo: nodeMeta.tipo,
            sensorId: nodeMeta.id,
            sensorName: nodeMeta.name,
            sensorShort: nodeMeta.shortName,
            sensorCode: nodeMeta.code,
            variableKey: variable.key,
            variableLabel: variable.label,
            value: isNullReading ? 'Sin señal' : evaluatedValue,
            rawValue,
            unit: variable.unit,
            min: variable.min,
            max: variable.max,
            hace_s,
            anomalias: rawAnomStr,
            translatedStatus: status,
            referenceNote: variable.referenceNote,
            severity,
            status,
            detail,
            timestamp: formatEpochTimestamp(msg.ts, msg.gw_ms),
            diagnostic: variable.diagnostic,
            icon: nodeMeta.icon,
            color: nodeMeta.color,
            msg,
          });
        }
      }

      evaluations.push({
        id: `${nodeMeta.id}-${variable.key}`,
        nodo: nodeMeta.nodo,
        tipo: nodeMeta.tipo,
        sensorId: nodeMeta.id,
        sensorShort: nodeMeta.shortName,
        sensorCode: nodeMeta.code,
        zone: nodeMeta.zone,
        variableKey: variable.key,
        variableLabel: variable.label,
        hasReceivedPacket,
        value: isNullReading ? null : evaluatedValue,
        displayValue: !hasReceivedPacket ? '--' : isNullReading ? 'Sin señal' : evaluatedValue,
        rawValue,
        unit: variable.unit,
        min: variable.min,
        max: variable.max,
        hace_s,
        isOffline,
        anomalias: rawAnomStr,
        translatedStatus: status,
        referenceNote: variable.referenceNote,
        status,
        severity,
        detail,
        icon: nodeMeta.icon,
        color: nodeMeta.color,
        msg,
      });
    });

    nodeStatuses.push({
      ...nodeMeta,
      hasReceivedPacket,
      hace_s,
      isOffline,
      anomalias: rawAnomStr,
      activeAnomalies,
      status: nodeOverallStatus,
      severity: nodeOverallSeverity,
      msg,
      timestamp: hasReceivedPacket
        ? formatEpochTimestamp(msg.ts, msg.gw_ms)
        : 'Sin conexión',
    });
  });

  return {
    evaluations,
    violations,
    nodeStatuses,
    latestSnapshot,
    tempMovingAvg5,
  };
}
