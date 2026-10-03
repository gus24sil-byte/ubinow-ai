import React from 'react';
import {
  TrendingUp,
  Target,
  QrCode,
  Zap,
  Repeat,
  Gift,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Users
} from 'lucide-react';

interface GrowthStrategyProps {
  onGoToSimulator: () => void;
}

export const GrowthStrategy: React.FC<GrowthStrategyProps> = ({ onGoToSimulator }) => {
  return (
    <div className="space-y-6">
      {/* Hero Strategy Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-4">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            Estrategia de Crecimiento Ubinow 300%
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
            Cómo multiplicar los viajes de Ubinow eliminando la barrera de descarga con WhatsApp y fidelizando en la App
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            El 70% de los usuarios que necesitan un auto de urgencia en la calle abandonan si deben descargar una aplicación de 80MB, crear cuenta con tarjeta y esperar validaciones. La solución es el <strong>Embudo Híbrido WhatsApp First → App Loyalty</strong>.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={onGoToSimulator}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>Ver el Bot de WhatsApp en Acción</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The 4 Pillars of the Growth Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">
            1. Adquisición Inmediata: Pedido por Ubicación GPS en 10 Segundos
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            El usuario solo envía su ubicación o audio a un número de WhatsApp oficial verificado. El bot detecta automáticamente la coordenada satelital, calcula la tarifa fija transparente en menos de 1 segundo y le da 3 opciones: Remis, Moto o Taxi.
          </p>
          <div className="text-[11px] text-emerald-400 font-mono">
            Tasa de conversión estimada: 4.2x superior a una app tradicional.
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">
            2. Estrategia Offline: QR en Bares, Hoteles, Hospitales y Aeropuertos
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Coloca adhesivos con QR en mostradores de hoteles, puertas de salida de boliches y clínicas: <em>"¿Necesitas Remis o Taxi ya? Escanea y pídelo en 1 toque por WhatsApp"</em>. El QR abre WhatsApp con el mensaje preescrito <code>"Hola Ubinow, quiero un auto"</code>.
          </p>
          <div className="text-[11px] text-blue-400 font-mono">
            Costo de adquisición de cliente (CAC): Prácticamente cero.
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">
            3. Puente de Retención: Del Bot de WhatsApp a la App Ubinow
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Al terminar el viaje en WhatsApp, el bot le envía su recibo digital y le dice: <em>"¡Descarga la App Ubinow y tienes $800 de saldo de regalo en tu segundo viaje + seguimiento en mapa satelital!"</em>. Conviertes usuarios ocasionales en clientes fieles de la App.
          </p>
          <div className="text-[11px] text-amber-400 font-mono">
            Retención a 30 días: +65% de usuarios migran a la app instalada.
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">
            4. Notificaciones Proactivas en Momentos de Alta Necesidad
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cuando el radar detecta lluvia repentina o es viernes a las 18:00 hs, el sistema dispara automáticamente una alerta Push y WhatsApp a los pasajeros de esa zona con un cupón del 20% OFF. Llenas la flota de choferes en horas valle y maximizas el ingreso en horas pico.
          </p>
          <div className="text-[11px] text-purple-400 font-mono">
            Ingreso incremental: +35% de viajes en días de lluvia y fines de semana.
          </div>
        </div>
      </div>
    </div>
  );
};
