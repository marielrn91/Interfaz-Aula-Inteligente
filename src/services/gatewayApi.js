/**
 * Servicio de comunicación HTTP con el Gateway ESP32 (red GEMELO-L419: http://192.168.4.1)
 * o con el simulador local en Python (http://localhost:8000).
 */

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || 'http://192.168.4.1').trim().replace(/\/+$/, '');
}

/**
 * Paso 4 / Punto 6 de la guía:
 * GET /api/hora?epoch_ms=HORA
 * Sirve para darle la hora al gateway (no tiene internet).
 * Llamarlo una vez al abrir la interfaz, poniendo la hora actual de la laptop en milisegundos.
 */
export async function syncGatewayClock(baseUrl, timeoutMs = 2500) {
  const url = `${normalizeBaseUrl(baseUrl)}/api/hora?epoch_ms=${Date.now()}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status, epoch_ms: Date.now() };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, error: err.message || 'No se pudo sincronizar /api/hora' };
  }
}

/**
 * Paso 4 / Punto 6 de la guía:
 * GET /api/ultimos
 * El último mensaje de cada sensor. Usar para mostrar el estado actual (pedirlo cada 2 segundos).
 * Formato de cada elemento:
 * {"nodo":1,"tipo":"co2","hace_s":2,"anomalias":"NINGUNA","msg":{ ...mensaje completo... }}
 */
export async function fetchGatewayUltimos(baseUrl, timeoutMs = 1800) {
  const url = `${normalizeBaseUrl(baseUrl)}/api/ultimos`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} en /api/ultimos`);
    }
    const data = await res.json();
    // Puede venir como array directo o dentro de una propiedad sensores/ultimos
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.sensores)
      ? data.sensores
      : Array.isArray(data?.ultimos)
      ? data.ultimos
      : Object.values(data || {});
    return list;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Paso 4 / Punto 6 de la guía:
 * GET /api/datos?desde=0
 * Todos los mensajes guardados, uno por línea (NDJSON / JSON Lines).
 * Usar para gráficas o historial. Para pedir solo los nuevos, cambiar el 0 por el último "id" recibido.
 */
export async function fetchGatewayDatosDesde(baseUrl, desdeId = 0, timeoutMs = 2200) {
  const url = `${normalizeBaseUrl(baseUrl)}/api/datos?desde=${encodeURIComponent(desdeId)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} en /api/datos?desde=${desdeId}`);
    }
    const rawText = await res.text();
    return parseDatosResponse(rawText);
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Parsea la respuesta de /api/datos?desde=ID que viene con un JSON por línea (NDJSON),
 * o también soporta un arreglo JSON estándar si el servidor devuelve `[...]`.
 */
export function parseDatosResponse(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const trimmed = rawText.trim();

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Fallback line by line
    }
  }

  const lines = trimmed.split(/\r?\n/);
  const messages = [];
  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;
    try {
      const obj = JSON.parse(clean);
      if (obj && typeof obj === 'object') {
        messages.push(obj.msg ? obj.msg : obj);
      }
    } catch {
      // Ignorar líneas malformadas o vacías
    }
  }
  return messages;
}
