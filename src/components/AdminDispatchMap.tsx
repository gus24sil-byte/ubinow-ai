import React, { useState } from 'react';
import {
  Car,
  Bike,
  Flame,
  Zap,
  Radio,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { Driver, PricingZone, Trip, VehicleType } from '../types/ubinow';

interface AdminDispatchMapProps {
  zones: PricingZone[];
  drivers: Driver[];
  trips: Trip[];
  onZoneSurgeChange: (zoneId: string, newSurge: number) => void;
  onDispatchManual: (driverId: string) => void;
}

export const AdminDispatchMap: React.FC<AdminDispatchMapProps> = ({
  zones,
  drivers,
  trips,
  onZoneSurgeChange,
  onDispatchManual,
}) => {
  const [selectedZone, setSelectedZone] = useState<PricingZone>(zones[0]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(drivers[0]);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleType>('all');
  const [isSimulatingSpike, setIsSimulatingSpike] = useState(false);

  const filteredDrivers = drivers.filter(
    (d) => vehicleFilter === 'all' || d.vehicleType === vehicleFilter
  );

  const activeTripsCount = trips.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length;
  const todayRevenue = trips.reduce((acc, t) => acc + t.finalPrice, 0);
  const avgSurge = (zones.reduce((acc, z) => acc + z.surgeMultiplier, 0) / zones.length).toFixed(2);
  const availableDriversCount = drivers.filter((d) => d.status === 'available').length;

  const handleSimulateSurgeSpike = (zoneId: string) => {
    setIsSimulatingSpike(true);
    const target = zones.find((z) => z.id === zoneId);
    if (target) {
      const nextSurge = Number((target.surgeMultiplier >= 1.8 ? 1.0 : target.surgeMultiplier + 0.35).toFixed(2));
      onZoneSurgeChange(zoneId, nextSurge);
    }
    setTimeout(() => setIsSimulatingSpike(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Viajes en Curso</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {activeTripsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400">+{trips.length} totales hoy</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Flota Activa</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {availableDriversCount} <span className="text-xs font-normal text-slate-400">/ {drivers.length}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {drivers.filter((d) => d.vehicleType === 'remis').length} Remises · {drivers.filter((d) => d.vehicleType === 'moto').length} Motos · {drivers.filter((d) => d.vehicleType === 'taxi').length} Taxis
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Surge Promedio</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            x{avgSurge}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Demanda dinámica activa
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Canal WhatsApp</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            78.4%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Tasa de conversión en bot
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Facturación del Día</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            ${todayRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Comisión Ubinow: ${(todayRevenue * 0.15).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Main Radar & Live Map Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive SVG City Radar Map */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Radar Urbano y Zonas de Calor Ubinow</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400">
                Monitoreo en tiempo real de demanda geoespacial y geohashes activos
              </p>
            </div>

            {/* Vehicle Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setVehicleFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  vehicleFilter === 'all'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({drivers.length})
              </button>
              <button
                onClick={() => setVehicleFilter('remis')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  vehicleFilter === 'remis'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Remis
              </button>
              <button
                onClick={() => setVehicleFilter('moto')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  vehicleFilter === 'moto'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Moto
              </button>
              <button
                onClick={() => setVehicleFilter('taxi')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  vehicleFilter === 'taxi'
                    ? 'bg-amber-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Taxi
              </button>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-[430px] bg-[#0c141f] rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* City Transit Arteries (SVG) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400">
              <defs>
                <linearGradient id="arteryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Major Highway Corridors */}
              <path
                d="M 50 180 Q 200 210 320 190 T 550 220"
                fill="none"
                stroke="#1e293b"
                strokeWidth="6"
              />
              <path
                d="M 50 180 Q 200 210 320 190 T 550 220"
                fill="none"
                stroke="url(#arteryGrad)"
                strokeWidth="2"
              />

              <path
                d="M 180 40 Q 220 180 250 360"
                fill="none"
                stroke="#1e293b"
                strokeWidth="6"
              />
              <path
                d="M 180 40 Q 220 180 250 360"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />

              <path
                d="M 400 30 Q 360 200 420 370"
                fill="none"
                stroke="#1e293b"
                strokeWidth="5"
              />
              <path
                d="M 400 30 Q 360 200 420 370"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeOpacity="0.3"
              />

              {/* River / Coast Outline */}
              <path
                d="M 520 20 Q 560 160 540 380"
                fill="none"
                stroke="#0284c7"
                strokeWidth="14"
                strokeOpacity="0.15"
              />

              {/* Zone Heat Bubbles */}
              {zones.map((zone, idx) => {
                const coords: Record<string, { cx: number; cy: number }> = {
                  'zone-centro': { cx: 310, cy: 195 },
                  'zone-norte': { cx: 240, cy: 110 },
                  'zone-aeropuerto': { cx: 480, cy: 80 },
                  'zone-sur': { cx: 280, cy: 300 },
                  'zone-oeste': { cx: 130, cy: 230 },
                };
                const { cx, cy } = coords[zone.id] || { cx: 300, cy: 200 };
                const isSelected = selectedZone.id === zone.id;
                const heatColor =
                  zone.surgeMultiplier >= 1.6
                    ? '#ef4444'
                    : zone.surgeMultiplier >= 1.3
                    ? '#f59e0b'
                    : '#10b981';

                return (
                  <g
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for high surge */}
                    {zone.surgeMultiplier > 1.2 && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 62 : 48}
                        fill="none"
                        stroke={heatColor}
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        className="animate-ping"
                      />
                    )}

                    {/* Heat area circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 52 : 40}
                      fill={heatColor}
                      fillOpacity={isSelected ? 0.25 : 0.14}
                      stroke={heatColor}
                      strokeWidth={isSelected ? 2 : 1}
                      strokeDasharray={isSelected ? '4 2' : 'none'}
                    />

                    {/* Zone center pin */}
                    <circle cx={cx} cy={cy} r="4" fill={heatColor} />

                    {/* Zone label & surge multiplier */}
                    <text
                      x={cx}
                      y={cy - 12}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="system-ui"
                    >
                      {zone.name.split('/')[0]}
                    </text>
                    <text
                      x={cx}
                      y={cy + 18}
                      textAnchor="middle"
                      fill={heatColor}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      x{zone.surgeMultiplier.toFixed(2)} · {zone.activeDemands} ped
                    </text>
                  </g>
                );
              })}

              {/* Driver Live Markers */}
              {filteredDrivers.map((driver, index) => {
                const driverCoords: Record<string, { x: number; y: number }> = {
                  'drv-01': { x: 300, y: 185 },
                  'drv-02': { x: 325, y: 215 },
                  'drv-03': { x: 235, y: 125 },
                  'drv-04': { x: 470, y: 95 },
                  'drv-05': { x: 275, y: 310 },
                };
                const { x, y } = driverCoords[driver.id] || { x: 200 + index * 50, y: 200 };
                const isSelected = selectedDriver?.id === driver.id;

                return (
                  <g
                    key={driver.id}
                    onClick={() => setSelectedDriver(driver)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 10 : 8}
                      fill={
                        driver.vehicleType === 'remis'
                          ? '#10b981'
                          : driver.vehicleType === 'moto'
                          ? '#38bdf8'
                          : '#f59e0b'
                      }
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y + 3}
                      textAnchor="middle"
                      fill="#020617"
                      fontSize="7"
                      fontWeight="bold"
                    >
                      {driver.vehicleType === 'moto' ? 'M' : driver.vehicleType === 'remis' ? 'R' : 'T'}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend Floating */}
            <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 backdrop-blur rounded-lg p-2.5 text-[10px] space-y-1">
              <div className="font-semibold text-slate-300 mb-1">Categorías de Vehículo:</div>
              <div className="flex items-center gap-3 text-slate-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Remis
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Moto
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Taxi
                </span>
              </div>
            </div>

            {/* Current Selected Zone Overlay Floating Top Right */}
            <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-800 backdrop-blur rounded-lg p-2.5 text-xs max-w-[210px] space-y-1.5">
              <div className="font-semibold text-white truncate">{selectedZone.name}</div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Multiplicador Surge:</span>
                <span className="font-mono text-amber-400 font-bold">x{selectedZone.surgeMultiplier.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Demanda Activa:</span>
                <span className="font-mono text-white font-semibold">{selectedZone.activeDemands} solicitudes</span>
              </div>
              <button
                onClick={() => handleSimulateSurgeSpike(selectedZone.id)}
                disabled={isSimulatingSpike}
                className="w-full mt-1 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[10px] font-medium transition-colors"
              >
                {isSimulatingSpike ? 'Calculando...' : '⚡ Forzar Pico de Demanda (+0.35x)'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Selected Zone & Driver Inspect Drawer */}
        <div className="lg:col-span-4 space-y-4">
          {/* Driver Inspector Card */}
          {selectedDriver ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  Ficha de Conductor Seleccionado
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                    selectedDriver.status === 'available'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {selectedDriver.status === 'available' ? 'Disponible' : 'En viaje'}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-white text-base">
                  {selectedDriver.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{selectedDriver.name}</h4>
                  <p className="text-xs text-slate-400 truncate">
                    {selectedDriver.vehicleModel} · {selectedDriver.color}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    Patente: {selectedDriver.plate}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Rating</div>
                  <div className="font-bold text-amber-400 font-mono flex items-center justify-center gap-0.5">
                    <span>{selectedDriver.rating}</span>
                    <span className="text-[10px]">★</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Viajes</div>
                  <div className="font-bold text-white font-mono">{selectedDriver.totalTrips}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Aceptación</div>
                  <div className="font-bold text-emerald-400 font-mono">{selectedDriver.acceptanceRate}%</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Insignias de Pasajeros
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedDriver.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onDispatchManual(selectedDriver.id)}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Asignar Próximo Viaje WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-400">
              Selecciona un vehículo en el radar para ver su telemetría.
            </div>
          )}

          {/* Zones Summary List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center justify-between">
              <span>Zonas Tarifarias Activas</span>
              <span className="text-[10px] text-slate-500 font-mono">Total {zones.length}</span>
            </h4>

            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedZone.id === zone.id
                      ? 'bg-slate-800 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white truncate max-w-[150px]">
                      {zone.name.split('/')[0]}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        zone.surgeMultiplier > 1.3
                          ? 'text-amber-400'
                          : zone.surgeMultiplier > 1.0
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      x{zone.surgeMultiplier.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{zone.activeDemands} pedidos</span>
                    <span>
                      {zone.availableDrivers.remis + zone.availableDrivers.moto + zone.availableDrivers.taxi} autos disp.
                    </span>
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
