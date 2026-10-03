import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MapPin,
  Car,
  Bike,
  Sparkles,
  CheckCheck,
  Phone,
  ShieldCheck,
  Star,
  RefreshCw,
  Navigation,
  ArrowRight,
  Clock,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Driver, PricingZone, PricingRule, Trip, TripQuote, VehicleType } from '../types/ubinow';
import { PRESET_ORIGINS, PRESET_DESTINATIONS } from '../data/mockData';

interface WhatsAppSimulatorProps {
  drivers: Driver[];
  zones: PricingZone[];
  pricingRules: Record<VehicleType, PricingRule>;
  onNewTripCreated: (trip: Trip) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text?: string;
  type?: 'text' | 'location_prompt' | 'quotes' | 'driver_assigned' | 'trip_completed' | 'discount_alert';
  quotes?: TripQuote[];
  assignedDriver?: Driver;
  assignedVehicleType?: VehicleType;
  selectedQuote?: TripQuote;
  origin?: { name: string; address: string };
  destination?: { name: string; address: string };
  completedTripId?: string;
  discountCode?: string;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  drivers,
  zones,
  pricingRules,
  onNewTripCreated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState(PRESET_ORIGINS[0]);
  const [selectedDestination, setSelectedDestination] = useState(PRESET_DESTINATIONS[0]);
  const [isLocating, setIsLocating] = useState(false);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [tripStep, setTripStep] = useState<'idle' | 'quoted' | 'en_route' | 'in_progress' | 'completed'>('idle');
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Puntual', 'Vehículo impecable']);
  const [couponCode, setCouponCode] = useState('UBIWHATSAPP25');
  const [appliedDiscount, setAppliedDiscount] = useState(500);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-1',
          sender: 'bot',
          timestamp: '14:40',
          text: '👋 ¡Hola! Bienvenido al asistente oficial de Ubinow.\n\nPuedes solicitar Remis, Moto o Taxi en segundos. Por favor envíame tu ubicación actual o presiona el botón de abajo para detectar tu GPS en tiempo real.',
          type: 'location_prompt',
        },
      ]);
    }
  }, []);

  // Calculate dynamic quotes based on origin & destination
  const calculateQuotes = (originZoneId: string, distanceKm: number, durationMin: number): TripQuote[] => {
    const zone = zones.find((z) => z.id === originZoneId) || zones[0];
    const surge = zone.surgeMultiplier;

    return (['moto', 'remis', 'taxi'] as VehicleType[]).map((vType) => {
      const rule = pricingRules[vType];
      const rawPrice = (rule.baseFare + rule.perKm * distanceKm + rule.perMinute * durationMin) * surge;
      const finalPrice = Math.max(rule.minimumFare, Math.round(rawPrice / 50) * 50);

      const names: Record<VehicleType, { title: string; desc: string; eta: number }> = {
        moto: {
          title: 'Ubinow Moto Express',
          desc: 'Rápido, económico y esquiva el tránsito pesado. Ideal para 1 persona.',
          eta: 3,
        },
        remis: {
          title: 'Ubinow Remis Ejecutivo',
          desc: 'Auto privado, tarifa fija preacordada, confort y aire acondicionado.',
          eta: 5,
        },
        taxi: {
          title: 'Ubinow Taxi Convencional',
          desc: 'Servicio de taxi regulado con chofer profesional y disponibilidad inmediata.',
          eta: 4,
        },
      };

      return {
        vehicleType: vType,
        displayName: names[vType].title,
        description: names[vType].desc,
        etaMinutes: names[vType].eta,
        basePrice: Math.round(rule.baseFare + rule.perKm * distanceKm),
        surgeMultiplier: surge,
        finalPrice,
        distanceKm,
        durationMin,
      };
    });
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: now,
      text: inputText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      handleBotResponseToText(inputText);
    }, 700);
  };

  const handleBotResponseToText = (text: string) => {
    const lower = text.toLowerCase();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (lower.includes('hola') || lower.includes('viaje') || lower.includes('auto') || lower.includes('remis') || lower.includes('taxi') || lower.includes('moto')) {
      const quotes = calculateQuotes(selectedOrigin.zoneId, selectedDestination.distanceKm, selectedDestination.estDurationMin);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `📍 Ubicación detectada:\n*Origen:* ${selectedOrigin.name}\n*Destino:* ${selectedDestination.name} (${selectedDestination.distanceKm} km ~ ${selectedDestination.estDurationMin} min)\n\nAquí tienes las opciones con tarifa transparente:`,
          type: 'quotes',
          quotes,
          origin: selectedOrigin,
          destination: selectedDestination,
        },
      ]);
    } else if (lower.includes('descuento') || lower.includes('promo') || lower.includes('cupon')) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `🎉 ¡Tienes disponible el cupón exclusivo *UBIWHATSAPP25* con $500 de descuento en tu próximo viaje!\n\nEnvía tu ubicación para cotizar con descuento automático.`,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `Te he entendido. Para enviar un conductor a tu posición, comparte tu ubicación o selecciona tu origen y destino con los botones.`,
        },
      ]);
    }
  };

  const handleSendLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg: ChatMessage = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        timestamp: now,
        text: `📍 Ubicación compartida en tiempo real: ${selectedOrigin.name} (${selectedOrigin.address})`,
      };
      setMessages((prev) => [...prev, userMsg]);

      setTimeout(() => {
        const quotes = calculateQuotes(selectedOrigin.zoneId, selectedDestination.distanceKm, selectedDestination.estDurationMin);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: now,
          text: `✅ Ubicación verificada en tiempo real por GPS.\nZona tarifaria: *${zones.find((z) => z.id === selectedOrigin.zoneId)?.name}*\n\nDestino estimado: *${selectedDestination.name}*\nDistancia: *${selectedDestination.distanceKm} km* (~${selectedDestination.estDurationMin} min)`,
          type: 'quotes',
          quotes,
          origin: selectedOrigin,
          destination: selectedDestination,
        };
        setMessages((prev) => [...prev, botMsg]);
      }, 600);
    }, 800);
  };

  const handleUseBrowserGPS = () => {
    if (!navigator.geolocation) {
      handleSendLocation();
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const customOrigin = {
          name: 'Mi Ubicación Actual GPS',
          address: `Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          zoneId: 'zone-centro',
        };
        setSelectedOrigin(customOrigin);

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [
          ...prev,
          {
            id: `usr-${Date.now()}`,
            sender: 'user',
            timestamp: now,
            text: `📍 GPS en vivo recibido: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`,
          },
        ]);

        setTimeout(() => {
          const quotes = calculateQuotes('zone-centro', selectedDestination.distanceKm, selectedDestination.estDurationMin);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              timestamp: now,
              text: `✅ ¡Ubicación exacta recibida por satélite!\nZona asignada: *Microcentro / Plaza Mayor*\n\nOpciones de viaje a *${selectedDestination.name}*:`,
              type: 'quotes',
              quotes,
              origin: customOrigin,
              destination: selectedDestination,
            },
          ]);
        }, 500);
      },
      () => {
        setIsLocating(false);
        handleSendLocation();
      }
    );
  };

  const handleSelectQuote = (quote: TripQuote) => {
    const available = drivers.filter((d) => d.vehicleType === quote.vehicleType && d.status === 'available');
    const assignedDriver = available.length > 0 ? available[0] : drivers.find((d) => d.vehicleType === quote.vehicleType) || drivers[0];

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderNum = `UBI-${Math.floor(10000 + Math.random() * 90000)}`;

    const finalPriceWithDiscount = Math.max(800, quote.finalPrice - appliedDiscount);

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      orderNumber: orderNum,
      channel: 'whatsapp',
      customerName: 'Cliente WhatsApp (+54 9 11)',
      customerPhone: '+54 9 11 7392-8114',
      driverId: assignedDriver.id,
      driverName: assignedDriver.name,
      driverVehicle: `${assignedDriver.vehicleModel} (${assignedDriver.color})`,
      driverPlate: assignedDriver.plate,
      vehicleType: quote.vehicleType,
      origin: selectedOrigin,
      destination: selectedDestination,
      distanceKm: quote.distanceKm,
      durationMin: quote.durationMin,
      status: 'driver_en_route',
      baseFare: quote.basePrice,
      surgeMultiplier: quote.surgeMultiplier,
      discountApplied: appliedDiscount,
      discountCode: couponCode,
      finalPrice: finalPriceWithDiscount,
      driverEarnings: Math.round(finalPriceWithDiscount * 0.85),
      ubinowFee: Math.round(finalPriceWithDiscount * 0.15),
      paymentMethod: 'mercadopago',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setActiveTrip(newTrip);
    setTripStep('en_route');
    onNewTripCreated(newTrip);

    // Bot confirmation message
    setMessages((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        timestamp: now,
        text: `Quiero pedir ${quote.displayName} ($${finalPriceWithDiscount})`,
      },
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: now,
        text: `🚖 *¡Viaje confirmado!* Pedido #${orderNum}\n\nConductor asignado: *${assignedDriver.name}*\nVehículo: *${assignedDriver.vehicleModel}*\nColor: *${assignedDriver.color}*\nPatente: *${assignedDriver.plate}*\nCalificación: *${assignedDriver.rating} ⭐* (${assignedDriver.totalTrips} viajes)\nTiempo de llegada estimado: *${quote.etaMinutes} minutos*`,
        type: 'driver_assigned',
        assignedDriver,
        assignedVehicleType: quote.vehicleType,
        selectedQuote: quote,
      },
    ]);
  };

  const handleSimulateArrival = () => {
    if (!activeTrip) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTripStep('in_progress');
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: now,
        text: `🚗 *Tu conductor ${activeTrip.driverName} ha llegado al punto de encuentro.*\n\nPor favor aborda el vehículo *${activeTrip.driverVehicle}* patente *${activeTrip.driverPlate}*.`,
      },
    ]);
  };

  const handleSimulateFinishTrip = () => {
    if (!activeTrip) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTripStep('completed');

    const updatedTrip: Trip = {
      ...activeTrip,
      status: 'completed',
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setActiveTrip(updatedTrip);

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: now,
        text: `🏁 *¡Has llegado a tu destino! Gracias por viajar con Ubinow.*\n\n*Resumen del Viaje #${activeTrip.orderNumber}:*\n• Distancia: ${activeTrip.distanceKm} km\n• Total a pagar: *$${activeTrip.finalPrice.toLocaleString()}*\n• Medio de pago: Mercado Pago / Efectivo\n• Descuento aplicado: -$${activeTrip.discountApplied}\n\n⭐ *¿Cómo calificarías tu viaje con ${activeTrip.driverName}?*`,
        type: 'trip_completed',
        completedTripId: activeTrip.id,
      },
    ]);
  };

  const handleSubmitRating = () => {
    if (!activeTrip) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        timestamp: now,
        text: `⭐ Calificación enviada: ${ratingStars}/5 estrellas. "${ratingComment || selectedTags.join(', ')}"`,
      },
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: now,
        text: `🙏 ¡Muchas gracias por tu calificación! Esto ayuda a mantener a los mejores conductores en Ubinow.\n\n🎁 *Te regalamos un cupón de $800 para tu próximo viaje si descargas la App Ubinow:*\nCódigo: *UBIAPP800*\nEnlace directo: https://ubinow.app/download`,
      },
    ]);

    setTripStep('idle');
    setActiveTrip(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left panel: Controls & Simulation parameters */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white">Simulador WhatsApp Bot Ubinow</h2>
              <p className="text-xs text-slate-400">Prueba el flujo de solicitud por GPS con fricción cero</p>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                setActiveTrip(null);
                setTripStep('idle');
              }}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Reiniciar chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick origin selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Punto de Origen (Geolocalización WhatsApp)</span>
              <button
                onClick={handleUseBrowserGPS}
                disabled={isLocating}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors"
              >
                <Navigation className="w-3 h-3" />
                <span>{isLocating ? 'Detectando...' : 'Usar mi GPS Real'}</span>
              </button>
            </label>
            <select
              value={selectedOrigin.name}
              onChange={(e) => {
                const found = PRESET_ORIGINS.find((o) => o.name === e.target.value);
                if (found) setSelectedOrigin(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {PRESET_ORIGINS.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick destination selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Punto de Destino
            </label>
            <select
              value={selectedDestination.name}
              onChange={(e) => {
                const found = PRESET_DESTINATIONS.find((d) => d.name === e.target.value);
                if (found) setSelectedDestination(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {PRESET_DESTINATIONS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.distanceKm} km ~ {d.estDurationMin} min)
                </option>
              ))}
            </select>
          </div>

          {/* Discount coupon configuration */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Cupón WhatsApp de Bienvenida
              </span>
              <span className="font-mono text-emerald-400 font-semibold">-${appliedDiscount}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="UBIWHATSAPP25"
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white flex-1 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => setAppliedDiscount(appliedDiscount === 0 ? 500 : 0)}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  appliedDiscount > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {appliedDiscount > 0 ? 'Aplicado' : 'Sin descuento'}
              </button>
            </div>
          </div>

          {/* Trip Lifecycle Controls for the Demo */}
          {activeTrip && (
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Viaje en Curso #{activeTrip.orderNumber}
                </span>
                <span className="text-slate-400 text-[11px] font-mono capitalize">
                  {tripStep === 'en_route' ? 'Chofer en camino' : tripStep === 'in_progress' ? 'En viaje' : 'Completado'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Chofer: <strong>{activeTrip.driverName}</strong> ({activeTrip.driverVehicle})
              </p>

              <div className="flex items-center gap-2 pt-1">
                {tripStep === 'en_route' && (
                  <button
                    onClick={handleSimulateArrival}
                    className="w-full text-xs font-medium py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded transition-colors"
                  >
                    Simular Llegada al Origen
                  </button>
                )}
                {tripStep === 'in_progress' && (
                  <button
                    onClick={handleSimulateFinishTrip}
                    className="w-full text-xs font-medium py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition-colors"
                  >
                    Finalizar Viaje en Destino
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Value proposition highlight */}
          <div className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800/80">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Install:</strong> El pasajero no necesita registrarse ni descargar apps para su primer viaje. Convierte 3x más rápido.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Tarifa Dinámica:</strong> Detecta la saturación de la zona en milisegundos y garantiza autos disponibles en horas pico.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Realistic WhatsApp Mobile Device Frame */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-full max-w-[420px] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[680px]">
          {/* WhatsApp Header */}
          <div className="bg-[#1F2C34] px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
                  U
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#1F2C34] rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white tracking-tight">Ubinow Bot Oficial</h3>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-[9px] text-white flex items-center justify-center font-bold">
                    ✓
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono">En línea · Cuenta de Empresa</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-4 h-4 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0B141A] text-xs">
            {/* WhatsApp encryption pill */}
            <div className="text-center my-1">
              <span className="inline-block bg-[#182229] text-amber-300/80 text-[10px] px-3 py-1 rounded-md max-w-[85%] leading-relaxed border border-amber-900/30">
                🔒 Los mensajes y la geolocalización están protegidos con cifrado de extremo a extremo de Ubinow.
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-[#005C4B] text-white rounded-tr-none'
                      : 'bg-[#202C33] text-slate-100 rounded-tl-none border border-slate-800'
                  }`}
                >
                  {msg.text && (
                    <div className="whitespace-pre-line leading-relaxed text-xs">
                      {msg.text}
                    </div>
                  )}

                  {/* Location Action Prompt */}
                  {msg.type === 'location_prompt' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-2">
                      <button
                        onClick={handleSendLocation}
                        disabled={isLocating}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors text-xs"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Compartir Ubicación Actual</span>
                      </button>
                      <button
                        onClick={() => handleBotResponseToText('Hola, quiero pedir un auto')}
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-center transition-colors text-[11px]"
                      >
                        Cotizar ruta {selectedOrigin.name.split('/')[0]} → {selectedDestination.name.split('/')[0]}
                      </button>
                    </div>
                  )}

                  {/* Vehicle Quotes Cards */}
                  {msg.type === 'quotes' && msg.quotes && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-2.5">
                      {msg.quotes.map((q) => {
                        const finalWithDiscount = Math.max(800, q.finalPrice - appliedDiscount);
                        return (
                          <div
                            key={q.vehicleType}
                            className="p-2.5 rounded-lg bg-[#111B21] border border-slate-700 hover:border-emerald-500 transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                                  {q.vehicleType === 'moto' && <Bike className="w-4 h-4" />}
                                  {q.vehicleType === 'remis' && <Car className="w-4 h-4" />}
                                  {q.vehicleType === 'taxi' && <Car className="w-4 h-4 text-amber-400" />}
                                </div>
                                <div>
                                  <div className="font-semibold text-white text-xs">{q.displayName}</div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Llega en {q.etaMinutes} min</span>
                                    {q.surgeMultiplier > 1.0 && (
                                      <span className="text-amber-400 font-mono ml-1">
                                        ⚡ x{q.surgeMultiplier.toFixed(2)} demanda
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold font-mono text-emerald-400">
                                  ${finalWithDiscount.toLocaleString()}
                                </div>
                                {appliedDiscount > 0 && (
                                  <div className="text-[10px] text-slate-500 line-through">
                                    ${q.finalPrice.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-300 leading-tight">
                              {q.description}
                            </p>

                            <button
                              onClick={() => handleSelectQuote(q)}
                              className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1"
                            >
                              <span>Pedir {q.displayName.split(' ')[1]}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rating Modal when Trip is Completed */}
                  {msg.type === 'trip_completed' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-3">
                      <div className="flex items-center justify-center gap-2 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingStars(star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= ratingStars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Quick Feedback Tags */}
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {['Puntual', 'Vehículo impecable', 'Manejo suave', 'Excelente trato', 'Rápido'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Escribe un comentario opcional..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />

                      <button
                        onClick={handleSubmitRating}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                      >
                        Enviar Calificación
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'user' && (
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Bar */}
          <div className="px-3 py-1.5 bg-[#182229] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={handleSendLocation}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202C33] text-emerald-400 hover:bg-slate-800 border border-emerald-500/30 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              <span>Enviar mi GPS</span>
            </button>
            <button
              onClick={() => handleBotResponseToText('Pedir un Remis')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202C33] text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Pedir Remis 🚗
            </button>
            <button
              onClick={() => handleBotResponseToText('Pedir una Moto')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202C33] text-slate-200 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Pedir Moto 🏍️
            </button>
            <button
              onClick={() => handleBotResponseToText('¿Hay cupones de descuento?')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-[#202C33] text-amber-300 hover:bg-slate-800 border border-amber-500/30 transition-colors"
            >
              Descuentos 🎁
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="p-2.5 bg-[#202C33] flex items-center gap-2 border-t border-slate-800">
            <button
              onClick={handleSendLocation}
              title="Adjuntar ubicación"
              className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Escribe un mensaje o envía tu destino..."
              className="flex-1 bg-[#2A3942] text-white placeholder-slate-400 rounded-lg px-3.5 py-2 text-xs focus:outline-none"
            />
            <button
              onClick={handleSendText}
              className="p-2 rounded-full bg-[#00A884] text-white hover:bg-emerald-500 transition-colors active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
