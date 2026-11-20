let globalMsgId = 1;
const seqCounters = {
  1: 10,
  2: 10,
  3: 10,
  4: 10,
  5: 10,
  6: 10,
  7: 10,
};
const startMs = Date.now() - 120000;

function jitter(base, variance, decimals = 1) {
  const val = base + (Math.random() - 0.5) * 2 * variance;
  return Number(val.toFixed(decimals));
}

export function resetSimulatorCounters() {
  globalMsgId = 1;
}

/**
 * Genera los 7 objetos de `/api/ultimos` y los 7 mensajes de `/api/datos?desde=ID`
 * respetando exactamente la estructura de `paquetes.h` y de la Tabla 3 del informe.
 */
export function generateNodeMessagesForScenario(scenarioId = 'nominal', customEpochMs = Date.now()) {
  const gwMs = Math.max(1000, customEpochMs - startMs);

  const state = {
    co2: {
      co2_ppm: Math.round(jitter(650, 18, 0)),
      delta_30s: Math.round(jitter(4, 6, 0)),
      temp_c: Math.round(jitter(24, 1, 0)),
      calentando: 0,
      nivel: 'NORMAL',
      anomalias: 'NINGUNA',
      anom_bits: 0,
      hace_s: 2,
    },
    audio: {
      leq_db: jitter(46.5, 2.0, 1),
      lmax_db: jitter(53.2, 2.5, 1),
      pico_db: jitter(58.0, 3.0, 1),
      base_db: jitter(39.4, 1.0, 1),
      anomalias: 'NINGUNA',
      anom_bits: 0,
      hace_s: 1,
    },
    gas: {
      rs_r0: jitter(0.98, 0.03, 2),
      do_alarma: 0,
      anomalias: 'NINGUNA',
      anom_bits: 0,
      hace_s: 3,
    },
    luz: {
      lux: jitter(460.0, 14.0, 1),
      lux_min: jitter(445.0, 10.0, 1),
      lux_max: jitter(475.0, 10.0, 1),
      lux_mesa_est: jitter(360.0, 10.0, 1),
      luces_cambio: 0,
      anomalias: 'NINGUNA',
      anom_bits: 0,
      hace_s: 2,
    },
    termico: {
      ocupacion_est: 24,
      entradas: Math.random() > 0.7 ? 1 : 0,
      salidas: Math.random() > 0.75 ? 1 : 0,
      anomalias: 'NINGUNA',
      anom_bits: 0,
      hace_s: 4,
    },
    magnetico: {
      puerta_abierta: 0,
      aperturas: 14,
      seg_abierta: 0,
      campo_raw: Math.round(jitter(820, 35, 0)), // < 1200 -> imán cerca -> puerta cerrada
      anomalias: 'NINGUNA',
      anom_bits: 0,
      hace_s: 2,
    },
    ambiente: {
      temp_c: jitter(23.2, 0.25, 1),
      hum_pct: jitter(51.0, 1.2, 1),
      pres_hpa: jitter(1013.25, 0.35, 2),
      anomalias: 'NINGUNA',
      anom_bits: 0,
      hace_s: 2,
    },
  };

  switch (scenarioId) {
    case 'co2_critico':
      state.co2.co2_ppm = Math.round(jitter(1640, 25, 0));
      state.co2.delta_30s = Math.round(jitter(325, 20, 0));
      state.co2.nivel = 'CRITICO';
      state.co2.anomalias = 'CO2_CRITICO';
      state.co2.anom_bits = 4;
      break;
    case 'co2_calentando':
      state.co2.co2_ppm = Math.round(jitter(415, 10, 0));
      state.co2.calentando = 1;
      state.co2.nivel = 'CALENTANDO';
      state.co2.anomalias = 'NINGUNA';
      break;
    case 'ruido_fuerte':
      state.audio.leq_db = jitter(76.4, 1.8, 1);
      state.audio.lmax_db = jitter(84.2, 2.0, 1);
      state.audio.pico_db = jitter(91.5, 2.5, 1);
      state.audio.base_db = jitter(58.0, 1.5, 1);
      state.audio.anomalias = 'RUIDO_FUERTE_SOSTENIDO';
      state.audio.anom_bits = 2;
      break;
    case 'gas_detectado':
      state.gas.rs_r0 = jitter(0.36, 0.03, 2);
      state.gas.do_alarma = 1;
      state.gas.anomalias = 'GAS_DETECTADO';
      state.gas.anom_bits = 1;
      break;
    case 'iluminacion_baja':
      state.luz.lux = jitter(135.0, 8.0, 1);
      state.luz.lux_min = jitter(125.0, 6.0, 1);
      state.luz.lux_max = jitter(145.0, 6.0, 1);
      state.luz.lux_mesa_est = jitter(88.4, 5.0, 1);
      state.luz.luces_cambio = -1;
      state.luz.anomalias = 'ILUMINACION_BAJA';
      state.luz.anom_bits = 2;
      break;
    case 'termico_anomalia':
      state.termico.ocupacion_est = 39;
      state.termico.entradas = 3;
      state.termico.salidas = 0;
      state.termico.anomalias = 'OBJETO_ESTATICO';
      state.termico.anom_bits = 2;
      break;
    case 'puerta_prolongada':
      state.magnetico.puerta_abierta = 1;
      state.magnetico.aperturas = 27;
      state.magnetico.seg_abierta = 645; // > 600 s (10 min) -> PUERTA_ABIERTA_PROLONGADA
      state.magnetico.campo_raw = Math.round(jitter(2480, 45, 0)); // > 1800 -> imán lejos -> puerta abierta
      state.magnetico.anomalias = 'PUERTA_ABIERTA_PROLONGADA';
      state.magnetico.anom_bits = 1;
      break;
    case 'ambiente_disconfort':
      state.ambiente.temp_c = jitter(28.8, 0.2, 1);
      state.ambiente.hum_pct = jitter(71.5, 1.0, 1);
      state.ambiente.pres_hpa = jitter(1011.8, 0.4, 2);
      state.ambiente.anomalias = 'TEMP_FUERA_CONFORT,HUMEDAD_ALTA';
      state.ambiente.anom_bits = 3;
      break;
    case 'fallo_y_desconexion':
      state.luz.lux = null;
      state.luz.lux_min = null;
      state.luz.lux_max = null;
      state.luz.lux_mesa_est = null;
      state.luz.luces_cambio = 0;
      state.luz.anomalias = 'FALLO_SENSOR';
      state.luz.anom_bits = 8;
      state.magnetico.hace_s = 85; // > 60s -> desconectado
      state.magnetico.campo_raw = 4095; // saturado >= 4075
      break;
    default:
      break;
  }

  const buildMsg = (nodo, macSuffix, tipo, payload) => {
    const seq = seqCounters[nodo]++;
    const { hace_s, ...fields } = payload;
    const msg = {
      id: globalMsgId++,
      nodo,
      mac: `24:6F:28:AB:12:0${macSuffix}`,
      seq,
      ts: customEpochMs,
      gw_ms: gwMs,
      uptime_ms: gwMs + 3000,
      perdidos: 0,
      tipo,
      ...fields,
    };
    return {
      nodo,
      tipo,
      hace_s,
      anomalias: fields.anomalias,
      msg,
    };
  };

  const ultimos = [
    buildMsg(1, 1, 'co2', state.co2),
    buildMsg(2, 2, 'audio', state.audio),
    buildMsg(3, 3, 'gas', state.gas),
    buildMsg(4, 4, 'luz', state.luz),
    buildMsg(5, 5, 'termico', state.termico),
    buildMsg(6, 6, 'magnetico', state.magnetico),
    buildMsg(7, 7, 'ambiente', state.ambiente),
  ];

  const nuevosDatos = ultimos.map((u) => u.msg);

  return { ultimos, nuevosDatos };
}
