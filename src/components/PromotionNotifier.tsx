import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  MessageSquare,
  Send,
  Sparkles,
  Tag,
  CheckCircle,
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { PromotionCampaign } from '../types/ubinow';

interface PromotionNotifierProps {
  campaigns: PromotionCampaign[];
  onSendCampaign: (campaign: PromotionCampaign) => void;
}

export const PromotionNotifier: React.FC<PromotionNotifierProps> = ({
  campaigns,
  onSendCampaign,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'both' | 'whatsapp_broadcast' | 'app_push'>('both');
  const [targetAudience, setTargetAudience] = useState<'all' | 'whatsapp_leads' | 'inactive_users' | 'zone_specific'>('whatsapp_leads');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('fixed_amount');
  const [discountValue, setDiscountValue] = useState<number>(500);
  const [couponCode, setCouponCode] = useState<string>('UBIFLASH500');
  const [title, setTitle] = useState<string>('¡Descuento Exclusivo Ubinow!');
  const [messageText, setMessageText] = useState<string>(
    '⚡ Hola! Notamos alta demanda en tu zona. Para tu comodidad, te regalamos $500 en tu próximo viaje en Remis o Moto por WhatsApp. Usa el código UBIFLASH500 o responde con tu ubicación.'
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  // Pre-made templates for quick growth hacking
  const TEMPLATES = [
    {
      name: 'Lluvia & Mal Clima (Surge Relief)',
      title: '☔ ¡No te mojes! Remis y Taxi con 20% OFF',
      text: '¿Está lloviendo? Pide tu auto en 1 minuto por WhatsApp o por la App Ubinow. Usa el código LLUVIA20 y viaja seguro y seco.',
      code: 'LLUVIA20',
      type: 'percentage' as const,
      value: 20,
    },
    {
      name: 'Viernes Moto-Express (Evitar atascos)',
      title: '🏍️ Esquiva el tráfico de las 18 hs en Moto',
      text: 'Llega a tiempo a casa o al trabajo. Solicita tu Moto Express por WhatsApp con $400 de descuento inmediato.',
      code: 'RAPIDO400',
      type: 'fixed_amount' as const,
      value: 400,
    },
    {
      name: 'Reactivación Inactivos (+7 días)',
      title: '👋 ¡Te extrañamos! Tu próximo viaje tiene $800 de regalo',
      text: 'Vuelve a viajar con Ubinow. Ingresa a la app o envía tu ubicación a este WhatsApp para disfrutar $800 de saldo bonificado.',
      code: 'VOLVER800',
      type: 'fixed_amount' as const,
      value: 800,
    },
  ];

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setMessageText(tmpl.text);
    setCouponCode(tmpl.code);
    setDiscountType(tmpl.type);
    setDiscountValue(tmpl.value);
  };

  const handleLaunchCampaign = () => {
    if (!title.trim() || !messageText.trim()) return;
    setIsSending(true);

    setTimeout(() => {
      const newCamp: PromotionCampaign = {
        id: `camp-${Date.now()}`,
        title,
        messageText,
        discountType,
        discountValue,
        couponCode,
        targetAudience,
        channel: selectedChannel,
        status: 'sent',
        sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        recipientsCount: targetAudience === 'all' ? 5200 : targetAudience === 'whatsapp_leads' ? 3100 : 1850,
        conversionCount: 0,
        revenueGenerated: 0,
      };

      onSendCampaign(newCamp);
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Motor de Notificaciones & Alertas de Descuentos Automatizadas</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Envío segmentado por Push en la App Ubinow y WhatsApp Broadcast para reactivar usuarios y llenar viajes en horas valle
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Canales habilitados:</span>
            <span className="text-emerald-400 font-medium">WhatsApp Cloud API</span>
            <span className="text-slate-600">·</span>
            <span className="text-blue-400 font-medium">Firebase FCM Push</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notification Creator */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">
              Nueva Alerta de Descuento
            </h3>

            {/* Quick Templates selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 text-[11px] hidden sm:inline">Plantillas:</span>
              <div className="flex gap-1">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded text-[11px] border border-slate-800 transition-colors"
                  >
                    {tmpl.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Channel Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Canal de Distribución
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedChannel('both')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  selectedChannel === 'both'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ambos Canales</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel('whatsapp_broadcast')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  selectedChannel === 'whatsapp_broadcast'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Bot</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel('app_push')}
                className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  selectedChannel === 'app_push'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Push App Ubinow</span>
              </button>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Audiencia Objetivo
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="whatsapp_leads">Contactos que consultaron por WhatsApp (~3,100 usuarios)</option>
              <option value="inactive_users">Usuarios sin viajes en los últimos 7 días (~1,850 usuarios)</option>
              <option value="all">Base completa de clientes Ubinow (~5,200 usuarios)</option>
              <option value="zone_specific">Pasajeros frecuentes en Microcentro y Zona Norte (~2,400)</option>
            </select>
          </div>

          {/* Title & Message */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Título de la Notificación / Asunto
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Cuerpo del Mensaje (Soporta variables y enlaces)
              </label>
              <textarea
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Discount settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Tipo Descuento</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="fixed_amount">Monto Fijo ($ ARS)</option>
                <option value="percentage">Porcentaje (%)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Valor</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Código Cupón</label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-semibold"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleLaunchCampaign}
              disabled={isSending}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Transmitiendo Notificaciones...' : 'Disparar Notificación Ahora'}</span>
            </button>
          </div>

          {sendSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>
                ¡Campaña enviada con éxito! Se registraron los envíos a los webhooks de WhatsApp y Firebase FCM.
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Mobile Notification Preview & Campaign History */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real Smartphone Push Preview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vista Previa en Celular del Pasajero</span>
            </h4>

            {/* Simulated Lockscreen / WhatsApp Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-slate-950 font-bold">
                    U
                  </span>
                  Ubinow App · Ahora
                </span>
                <span className="text-[9px]">14:48</span>
              </div>
              <div className="font-semibold text-xs text-white">{title}</div>
              <p className="text-[11px] text-slate-300 leading-snug">{messageText}</p>
              <div className="pt-1.5 flex items-center gap-2">
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Cupón: {couponCode}
                </span>
                <span className="text-[10px] text-slate-400">Toca para pedir auto</span>
              </div>
            </div>
          </div>

          {/* Past Campaigns Log */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center justify-between">
              <span>Campañas Recientes & Métricas</span>
              <span className="text-[10px] text-slate-400 font-mono">{campaigns.length} lanzadas</span>
            </h4>

            <div className="space-y-2.5">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-white">{camp.title}</h5>
                      <span className="text-[10px] text-slate-400">
                        {camp.sentAt || 'Programada'} · Cupón: <strong className="text-emerald-400">{camp.couponCode}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded capitalize">
                      {camp.channel.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-900">
                    <div>
                      <div className="text-[10px] text-slate-500">Destinatarios</div>
                      <div className="font-mono font-semibold text-slate-200">
                        {camp.recipientsCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Viajes Logrados</div>
                      <div className="font-mono font-semibold text-emerald-400">
                        {camp.conversionCount}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Facturación</div>
                      <div className="font-mono font-semibold text-white">
                        ${(camp.revenueGenerated / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
