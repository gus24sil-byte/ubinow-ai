import React, { useState } from 'react';
import {
  Server,
  Cloud,
  Layers,
  Database,
  Cpu,
  Zap,
  Shield,
  Code2,
  CheckCircle,
  Copy,
  ArrowRight,
  GitBranch,
  Terminal,
  ExternalLink,
  Smartphone,
  MessageSquare
} from 'lucide-react';

export const CloudArchitectureGuide: React.FC = () => {
  const [selectedCloud, setSelectedCloud] = useState<'aws' | 'gcp'>('gcp');
  const [activeCodeTab, setActiveCodeTab] = useState<'webhook' | 'surge' | 'sql'>('webhook');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (codeText: string, key: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const WHATSAPP_WEBHOOK_CODE = `// src/controllers/whatsappWebhook.ts
import { Request, Response } from 'express';
import { calculateSurgeMultiplier } from '../services/pricingService';
import { findNearestDrivers } from '../services/dispatchService';
import { sendWhatsAppTemplate, sendWhatsAppTextMessage } from '../services/metaApiService';

// 1. Verificación del Webhook con Meta Cloud API
export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('[Meta Webhook] Verificado con éxito');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

// 2. Procesamiento de Mensajes y Ubicación GPS
export const handleIncomingMessage = async (req: Request, res: Response) => {
  res.sendStatus(200); // Meta exige respuesta 200 inmediata

  const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];
  const fromPhone = message?.from;

  if (!message || !fromPhone) return;

  // CASO A: El usuario envió su ubicación GPS en tiempo real
  if (message.type === 'location') {
    const { latitude, longitude, name, address } = message.location;
    console.log(\`[GPS Recibido] De: \${fromPhone} -> Lat: \${latitude}, Lng: \${longitude}\`);

    // Calcular tarifa dinámica para la coordenada usando Redis Geohash
    const surge = await calculateSurgeMultiplier(latitude, longitude);
    
    // Obtener vehículos disponibles cercanos
    const nearest = await findNearestDrivers(latitude, longitude, 5000); // 5km radio

    const quoteText = 
      \`📍 *Ubicación confirmada:* \${name || address || 'Tu posición GPS'}\\n\` +
      \`⚡ *Demanda en zona:* \${surge > 1.0 ? \`x\${surge.toFixed(2)} (Alta demanda)\` : 'Tarifa Normal 1.0x'}\\n\\n\` +
      \`Elige tu vehículo respondiendo con el número:\\n\` +
      \`1️⃣ *Remis Ejecutivo* - $3,800 (Llega en 4 min)\\n\` +
      \`2️⃣ *Moto Express* - $1,900 (Llega en 2 min)\\n\` +
      \`3️⃣ *Taxi Regulado* - $3,200 (Llega en 3 min)\\n\\n\` +
      \`🎁 Tienes $500 OFF con código: *UBIWHATSAPP25*\`;

    await sendWhatsAppTextMessage(fromPhone, quoteText);
    return;
  }

  // CASO B: Mensaje de texto estándar
  if (message.type === 'text') {
    const userText = message.text.body.trim().toLowerCase();
    
    if (userText === '1' || userText.includes('remis')) {
      // Disparar despacho de Remis en WebSocket
      await sendWhatsAppTextMessage(fromPhone, '🚗 *Buscando tu Remis más cercano...* Te avisaremos en segundos.');
    } else {
      await sendWhatsAppTextMessage(
        fromPhone,
        '👋 ¡Hola! Para pedir un Remis, Moto o Taxi en Ubinow, por favor toca el clip 📎 y comparte tu *Ubicación en tiempo real*.'
      );
    }
  }
};`;

  const SURGE_ENGINE_CODE = `// src/services/pricingService.ts
import { Redis } from 'ioredis';
import { h3Index } from 'h3-js';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Calcula el multiplicador de tarifa dinámica en <5ms
 * utilizando índices espaciales H3 y ventanas de tiempo en Redis
 */
export async function calculateSurgeMultiplier(lat: number, lng: number): Promise<number> {
  // H3 Resolución 7 (~1.2 km de diámetro por celda hexagonal)
  const h3Cell = h3Index(lat, lng, 7);
  
  const now = Date.now();
  const windowStart = now - (5 * 60 * 1000); // Últimos 5 minutos

  // 1. Contar solicitudes recientes en la celda
  const demandKey = \`surge:demand:\${h3Cell}\`;
  await redis.zadd(demandKey, now, \`req:\${now}:\${Math.random()}\`);
  await redis.zremrangebyscore(demandKey, 0, windowStart);
  const activeDemands = await redis.zcard(demandKey);

  // 2. Contar conductores libres dentro de la celda
  const supplyKey = \`surge:supply:\${h3Cell}\`;
  const availableDrivers = (await redis.scard(supplyKey)) || 1;

  // 3. Ratio de Demanda sobre Oferta
  const ratio = activeDemands / Math.max(availableDrivers, 1);

  let surge = 1.0;
  if (ratio > 3.0) {
    surge = 1.80; // Alta demanda extrema
  } else if (ratio > 2.0) {
    surge = 1.45; // Demanda moderada
  } else if (ratio > 1.3) {
    surge = 1.20; // Leve incremento
  }

  // Tope de seguridad para evitar precios abusivos
  return Math.min(surge, 2.50);
}`;

  const SQL_SCHEMA_CODE = `-- PostgreSQL + PostGIS Schema para Ubinow
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Zonas y Geofences
CREATE TABLE pricing_zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    polygon GEOMETRY(Polygon, 4326),
    base_surge NUMERIC(3,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Conductores (Remis, Moto, Taxi)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('remis', 'moto', 'taxi')),
    vehicle_model VARCHAR(100),
    plate VARCHAR(20) UNIQUE NOT NULL,
    rating NUMERIC(3,2) DEFAULT 5.00,
    total_trips INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('available', 'busy', 'offline')),
    last_location GEOMETRY(Point, 4326),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_drivers_geom ON drivers USING GIST(last_location);

-- 3. Viajes (WhatsApp & App Móvil)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('whatsapp', 'app_ubinow')),
    customer_phone VARCHAR(30) NOT NULL,
    customer_name VARCHAR(100),
    driver_id UUID REFERENCES drivers(id),
    vehicle_type VARCHAR(20) NOT NULL,
    origin_point GEOMETRY(Point, 4326) NOT NULL,
    origin_address TEXT NOT NULL,
    destination_point GEOMETRY(Point, 4326) NOT NULL,
    destination_address TEXT NOT NULL,
    distance_km NUMERIC(5,2) NOT NULL,
    duration_min INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'requested',
    base_fare NUMERIC(10,2) NOT NULL,
    surge_multiplier NUMERIC(3,2) DEFAULT 1.00,
    discount_applied NUMERIC(10,2) DEFAULT 0.00,
    final_price NUMERIC(10,2) NOT NULL,
    driver_earnings NUMERIC(10,2) NOT NULL,
    ubinow_fee NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_trips_origin_geom ON trips USING GIST(origin_point);
CREATE INDEX idx_trips_status ON trips(status);

-- 4. Calificaciones y Calidad
CREATE TABLE trip_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id),
    driver_id UUID REFERENCES drivers(id),
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span>Arquitectura Cloud Escalable: AWS vs Google Cloud (GCP)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Diseño de infraestructura de alta concurrencia para soportar más de 100.000 viajes mensuales con latencia menor a 200ms
            </p>
          </div>

          {/* Cloud Toggle Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setSelectedCloud('gcp')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                selectedCloud === 'gcp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Google Cloud (GCP) Recomendado
            </button>
            <button
              onClick={() => setSelectedCloud('aws')}
              className={`px-3 py-1.5 rounded transition-colors font-medium ${
                selectedCloud === 'aws'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Amazon Web Services (AWS)
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Components Architecture Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center justify-between border-b border-slate-800 pb-3">
          <span>Mapa de Servicios en la Nube ({selectedCloud.toUpperCase()})</span>
          <span className="text-[11px] font-mono text-emerald-400">
            Microservicios Desacoplados
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              1. Ingesta & WhatsApp Webhook
            </div>
            <div className="font-bold text-white text-sm">
              {selectedCloud === 'gcp' ? 'Cloud Run / Cloud Functions' : 'AWS Lambda + API Gateway'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Recibe los webhooks HTTPS de Meta Cloud API, valida firmas SHA256 y extrae coordenadas GPS en &lt;50ms.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              2. Surge & Cache Espacial
            </div>
            <div className="font-bold text-emerald-400 text-sm">
              {selectedCloud === 'gcp' ? 'Memorystore for Redis' : 'Amazon ElastiCache for Redis'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Geohashing y celdas H3 en memoria RAM. Calcula demanda por segundo y devuelve el multiplicador en 2ms.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              3. Despacho & Notificaciones
            </div>
            <div className="font-bold text-blue-400 text-sm">
              {selectedCloud === 'gcp' ? 'Firebase Cloud Messaging + Pub/Sub' : 'AWS SNS + EventBridge + WebSockets'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Envío instantáneo de alertas Push a conductores y templates de WhatsApp a pasajeros con cupones de descuento.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              4. Base de Datos Transaccional
            </div>
            <div className="font-bold text-purple-400 text-sm">
              {selectedCloud === 'gcp' ? 'Cloud SQL PostgreSQL (PostGIS)' : 'Amazon Aurora PostgreSQL (PostGIS)'}
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Persistencia ACID de viajes, balances financieros, comisiones Ubinow, historial y calificaciones con índices espaciales GIST.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Implementation Roadmap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
          Hoja de Ruta de Implementación Paso a Paso (6 Fases)
        </h3>

        <div className="space-y-3.5 text-xs">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Fase 1: Configurar Meta WhatsApp Cloud API & Webhook de Ubicación
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Semana 1
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Crear una cuenta comercial en <strong>Meta for Developers</strong>, verificar número oficial de Ubinow, y configurar el webhook apuntando al endpoint de {selectedCloud === 'gcp' ? 'Cloud Run' : 'API Gateway'}. Configurar el parseador de mensajes tipo <code className="text-emerald-400 font-mono">location</code> para recibir latitud, longitud y dirección sin fricción.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Fase 2: Motor de Geohash y Tarifas Dinámicas (Surge Engine)
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Semana 2
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Implementar celdas espaciales <strong>H3 (Resolución 7)</strong> en Redis ({selectedCloud === 'gcp' ? 'Memorystore' : 'ElastiCache'}). Cada solicitud entrante incrementa el contador de la celda con TTL de 5 minutos. Si el ratio Demanda/Oferta supera 1.8x, se aplica automáticamente el multiplicador (1.2x a 2.0x).
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Fase 3: Motor de Matching y Despacho en Tiempo Real
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Semana 3
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Búsqueda de los 3 choferes más cercanos al punto de encuentro usando la consulta PostGIS <code className="text-emerald-400 font-mono">ST_DWithin()</code>. Se emite una alerta por WebSocket a la App de choferes. El primer chofer en presionar "Aceptar" obtiene el viaje; si nadie acepta en 15s, pasa automáticamente a la siguiente ronda.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Fase 4: Notificaciones Push de Descuentos & Re-engagement
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Semana 4
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Integrar Firebase Cloud Messaging (FCM) para los usuarios con la App móvil y plantillas autorizadas de WhatsApp Business (HSM) para enviar promociones geolocalizadas ("Lluvia en tu zona: 25% OFF"). Se dispara desde el Panel de Administración Web con 1 solo clic.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Fase 5: Base de Datos Relacional, Historial y Facturación
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Semana 5
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Despliegue del schema PostgreSQL en {selectedCloud === 'gcp' ? 'Cloud SQL' : 'RDS Aurora'}. Almacenamiento con integridad transaccional de pagos, porcentaje de comisión de Ubinow (12% a 15%), desglose de tarifa y generación de recibo digital imprimible o exportable.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">
                Fase 6: Sistema de Calificaciones, Alertas de Calidad & Métricas
              </span>
              <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                Semana 6
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Al finalizar cada viaje, el bot de WhatsApp y la App envían un selector interactivo de 1 a 5 estrellas con tags. Los choferes con rating inferior a 4.30 entran en cola de suspensión preventiva, garantizando la calidad y fidelidad de los usuarios de Ubinow.
            </p>
          </div>
        </div>
      </div>

      {/* Production Code Snippets Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Código Fuente Listo para Producción
            </h3>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveCodeTab('webhook')}
              className={`px-3 py-1 rounded transition-colors ${
                activeCodeTab === 'webhook'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Webhook WhatsApp (TypeScript)
            </button>
            <button
              onClick={() => setActiveCodeTab('surge')}
              className={`px-3 py-1 rounded transition-colors ${
                activeCodeTab === 'surge'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Surge Engine (Redis/H3)
            </button>
            <button
              onClick={() => setActiveCodeTab('sql')}
              className={`px-3 py-1 rounded transition-colors ${
                activeCodeTab === 'sql'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Schema SQL (PostgreSQL/PostGIS)
            </button>
          </div>
        </div>

        {/* Code display with copy button */}
        <div className="relative bg-[#0d1117] rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => {
              const code =
                activeCodeTab === 'webhook'
                  ? WHATSAPP_WEBHOOK_CODE
                  : activeCodeTab === 'surge'
                  ? SURGE_ENGINE_CODE
                  : SQL_SCHEMA_CODE;
              handleCopy(code, activeCodeTab);
            }}
            className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copiedCode === activeCodeTab ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>

          <pre className="text-slate-300 leading-relaxed">
            {activeCodeTab === 'webhook' && WHATSAPP_WEBHOOK_CODE}
            {activeCodeTab === 'surge' && SURGE_ENGINE_CODE}
            {activeCodeTab === 'sql' && SQL_SCHEMA_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
};
