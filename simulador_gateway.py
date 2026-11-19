#!/usr/bin/env python3
"""
simulador_gateway.py — Simulador del Gateway ESP32 (Red GEMELO-L419)
Sirve exactamente los endpoints descritos en la guía en http://localhost:8000:
  - GET /api/ultimos            -> Último mensaje de cada uno de los 7 nodos
  - GET /api/datos?desde=0      -> Todos los mensajes guardados, uno por línea (NDJSON)
  - GET /api/hora?epoch_ms=HORA -> Sincroniza la hora del gateway en milisegundos
"""

import json
import random
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

PORT = 8000
START_MS = int(time.time() * 1000)

state = {
    "epoch_offset_ms": int(time.time() * 1000) - START_MS,
    "has_clock": True,
    "next_id": 1,
    "seq": {1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1},
    "last_generate_ts": 0.0,
    "ultimos": [],
    "historial": [],
}


def current_gw_ms():
    return int(time.time() * 1000) - START_MS


def current_ts():
    if not state["has_clock"]:
        return None
    return START_MS + state["epoch_offset_ms"] + current_gw_ms()


def generate_cycle():
    now_sec = time.time()
    if now_sec - state["last_generate_ts"] < 1.8 and state["ultimos"]:
        return

    state["last_generate_ts"] = now_sec
    gw_ms = current_gw_ms()
    ts = current_ts()

    nodes_payloads = [
        (
            1,
            "co2",
            {
                "co2_ppm": random.randint(610, 720),
                "delta_30s": random.randint(-8, 15),
                "temp_c": 24,
                "calentando": 0,
                "nivel": "NORMAL",
                "anomalias": "NINGUNA",
                "anom_bits": 0,
            },
        ),
        (
            2,
            "audio",
            {
                "leq_db": round(random.uniform(44.0, 52.0), 1),
                "lmax_db": round(random.uniform(53.0, 60.0), 1),
                "pico_db": round(random.uniform(60.0, 66.0), 1),
                "base_db": round(random.uniform(38.0, 41.0), 1),
                "anomalias": "NINGUNA",
                "anom_bits": 0,
            },
        ),
        (
            3,
            "gas",
            {
                "rs_r0": round(random.uniform(0.94, 1.03), 2),
                "do_alarma": 0,
                "anomalias": "NINGUNA",
                "anom_bits": 0,
            },
        ),
        (
            4,
            "luz",
            {
                "lux": round(random.uniform(475.0, 525.0), 1),
                "lux_min": round(random.uniform(465.0, 475.0), 1),
                "lux_max": round(random.uniform(525.0, 540.0), 1),
                "lux_mesa_est": round(random.uniform(330.0, 365.0), 1),
                "luces_cambio": 0,
                "anomalias": "NINGUNA",
                "anom_bits": 0,
            },
        ),
        (
            5,
            "termico",
            {
                "ocupacion_est": 25,
                "entradas": random.choice([0, 0, 1]),
                "salidas": random.choice([0, 0, 1]),
                "anomalias": "NINGUNA",
                "anom_bits": 0,
            },
        ),
        (
            6,
            "magnetico",
            {
                "puerta_abierta": 0,
                "aperturas": 12,
                "seg_abierta": 0,
                "anomalias": "NINGUNA",
                "anom_bits": 0,
            },
        ),
        (
            7,
            "ambiente",
            {
                "temp_c": round(random.uniform(22.6, 23.8), 1),
                "hum_pct": round(random.uniform(48.5, 53.0), 1),
                "pres_hpa": round(random.uniform(1012.8, 1013.7), 1),
                "anomalias": "NINGUNA",
                "anom_bits": 0,
            },
        ),
    ]

    ultimos = []
    for nodo, tipo, extra in nodes_payloads:
        msg_id = state["next_id"]
        state["next_id"] += 1
        seq = state["seq"][nodo]
        state["seq"][nodo] += 1

        msg = {
            "id": msg_id,
            "nodo": nodo,
            "mac": f"24:6F:28:AB:12:0{nodo}",
            "seq": seq,
            "ts": ts,
            "gw_ms": gw_ms,
            "uptime_ms": gw_ms + 3000,
            "perdidos": 0,
            "tipo": tipo,
            **extra,
        }

        state["historial"].append(msg)
        ultimos.append(
            {
                "nodo": nodo,
                "tipo": tipo,
                "hace_s": random.randint(1, 3),
                "anomalias": extra["anomalias"],
                "msg": msg,
            }
        )

    # Mantener los últimos 500 mensajes en memoria
    state["historial"] = state["historial"][-500:]
    state["ultimos"] = ultimos


class GatewayHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self, content_type="application/json; charset=utf-8"):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_OPTIONS(self):
        self._send_cors_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        generate_cycle()

        if path == "/api/hora":
            epoch_list = query.get("epoch_ms", [])
            if epoch_list:
                try:
                    epoch_ms = int(epoch_list[0])
                    state["epoch_offset_ms"] = epoch_ms - START_MS - current_gw_ms()
                    state["has_clock"] = True
                except ValueError:
                    pass
            self._send_cors_headers()
            self.wfile.write(
                json.dumps({"ok": True, "ts": current_ts()}).encode("utf-8")
            )
            return

        if path == "/api/ultimos":
            self._send_cors_headers()
            self.wfile.write(json.dumps(state["ultimos"]).encode("utf-8"))
            return

        if path == "/api/datos":
            desde = 0
            try:
                desde = int(query.get("desde", ["0"])[0])
            except ValueError:
                desde = 0
            filtrados = [m for m in state["historial"] if m["id"] > desde]
            ndjson = "\n".join(json.dumps(m) for m in filtrados)
            self._send_cors_headers("text/plain; charset=utf-8")
            self.wfile.write(ndjson.encode("utf-8"))
            return

        # Página raíz informativa
        self._send_cors_headers("text/html; charset=utf-8")
        html = f"""<!doctype html>
<html>
<head><meta charset="utf-8"><title>Simulador Gateway GEMELO-L419</title></head>
<body style="font-family:sans-serif;padding:20px;">
  <h2>Simulador Gateway ESP32 — GEMELO-L419</h2>
  <p>Endpoints activos:</p>
  <ul>
    <li><a href="/api/ultimos">/api/ultimos</a></li>
    <li><a href="/api/datos?desde=0">/api/datos?desde=0</a></li>
    <li><code>/api/hora?epoch_ms=HORA</code></li>
  </ul>
</body>
</html>"""
        self.wfile.write(html.encode("utf-8"))

    def log_message(self, format, *args):
        return


if __name__ == "__main__":
    generate_cycle()
    print(f"Simulador Gateway GEMELO-L419 escuchando en http://localhost:{PORT}")
    print("  - http://localhost:8000/api/ultimos")
    print("  - http://localhost:8000/api/datos?desde=0")
    print("  - http://localhost:8000/api/hora?epoch_ms=...")
    server = HTTPServer(("0.0.0.0", PORT), GatewayHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSimulador detenido.")
