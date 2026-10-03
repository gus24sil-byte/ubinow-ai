import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Car,
  Bike,
  Star,
  Download,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  X
} from 'lucide-react';
import { Trip, VehicleType } from '../types/ubinow';

interface TripHistoryProps {
  trips: Trip[];
}

export const TripHistory: React.FC<TripHistoryProps> = ({ trips }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'app_ubinow'>('all');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleType>('all');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.origin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesChannel = channelFilter === 'all' || trip.channel === channelFilter;
    const matchesVehicle = vehicleFilter === 'all' || trip.vehicleType === vehicleFilter;

    return matchesSearch && matchesChannel && matchesVehicle;
  });

  const handleExportCSV = () => {
    const headers = 'Orden,Canal,Cliente,Conductor,Vehiculo,Origen,Destino,DistanciaKm,PrecioFinal,MetodoPago,Fecha\n';
    const rows = filteredTrips
      .map(
        (t) =>
          `"${t.orderNumber}","${t.channel}","${t.customerName}","${t.driverName}","${t.vehicleType}","${t.origin.name}","${t.destination.name}",${t.distanceKm},${t.finalPrice},"${t.paymentMethod}","${t.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ubinow_historial_viajes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Historial Detallado de Viajes Realizados</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditoría completa de pedidos por WhatsApp y App, trazabilidad de cobros, comisiones y calificaciones
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por orden, cliente, chofer o dirección..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Channel Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                channelFilter === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                channelFilter === 'whatsapp'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setChannelFilter('app_ubinow')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                channelFilter === 'app_ubinow'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>App</span>
            </button>
          </div>

          {/* Vehicle Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setVehicleFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                vehicleFilter === 'all'
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cualquiera
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
      </div>

      {/* Trips Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Canal</th>
                <th className="py-3 px-4">Vehículo</th>
                <th className="py-3 px-4">Ruta (Origen → Destino)</th>
                <th className="py-3 px-4 text-right">Distancia</th>
                <th className="py-3 px-4 text-right">Tarifa / Surge</th>
                <th className="py-3 px-4">Chofer</th>
                <th className="py-3 px-4">Calificación</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No se encontraron viajes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {trip.orderNumber}
                    </td>

                    <td className="py-3 px-4">
                      {trip.channel === 'whatsapp' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                          <Smartphone className="w-3 h-3" />
                          <span>App Ubinow</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 capitalize">
                      <div className="flex items-center gap-1.5">
                        {trip.vehicleType === 'moto' && <Bike className="w-3.5 h-3.5 text-blue-400" />}
                        {trip.vehicleType === 'remis' && <Car className="w-3.5 h-3.5 text-emerald-400" />}
                        {trip.vehicleType === 'taxi' && <Car className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="text-slate-300">{trip.vehicleType}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="truncate font-medium text-white">{trip.origin.name}</div>
                      <div className="truncate text-[11px] text-slate-400">→ {trip.destination.name}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {trip.distanceKm} km
                      <div className="text-[10px] text-slate-500">{trip.durationMin} min</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="font-bold text-emerald-400">
                        ${trip.finalPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Surge x{trip.surgeMultiplier.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{trip.driverName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{trip.driverPlate}</div>
                    </td>

                    <td className="py-3 px-4">
                      {trip.rating ? (
                        <div className="flex items-center gap-1 text-amber-400 font-mono">
                          <span>{trip.rating}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Pendiente</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrip(trip);
                        }}
                        className="text-slate-400 group-hover:text-emerald-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Ver detalle de recibo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trip Detail Modal Drawer */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedTrip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-emerald-400">Recibo Oficial Ubinow</span>
                <h3 className="text-lg font-bold text-white">Viaje #{selectedTrip.orderNumber}</h3>
              </div>
              <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded capitalize">
                {selectedTrip.channel.replace('_', ' ')}
              </span>
            </div>

            {/* Origin & Destination */}
            <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">{selectedTrip.origin.name}</div>
                  <div className="text-[11px] text-slate-400">{selectedTrip.origin.address}</div>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-slate-800 ml-2 pl-4 py-1" />
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">{selectedTrip.destination.name}</div>
                  <div className="text-[11px] text-slate-400">{selectedTrip.destination.address}</div>
                </div>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tarifa Base</span>
                <span className="font-mono text-slate-200">${selectedTrip.baseFare}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Multiplicador Dinámico por Demanda (Surge)</span>
                <span className="font-mono text-amber-400">x{selectedTrip.surgeMultiplier.toFixed(2)}</span>
              </div>
              {selectedTrip.discountApplied > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento Promoción ({selectedTrip.discountCode || 'CUPÓN'})</span>
                  <span className="font-mono">-${selectedTrip.discountApplied}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                <span>Total Abonado</span>
                <span className="text-emerald-400 font-mono">${selectedTrip.finalPrice.toLocaleString()} ARS</span>
              </div>
            </div>

            {/* Payout split */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg text-xs">
              <div>
                <span className="text-[10px] text-slate-500">Pago a Conductor</span>
                <div className="font-mono font-semibold text-white">
                  ${selectedTrip.driverEarnings.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Comisión Ubinow</span>
                <div className="font-mono font-semibold text-emerald-400">
                  ${selectedTrip.ubinowFee.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Driver and Rating */}
            <div className="border-t border-slate-800 pt-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Conductor:</span>
                <strong className="text-white">{selectedTrip.driverName}</strong> ({selectedTrip.driverVehicle})
              </div>
              {selectedTrip.rating && (
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Calificación Pasajero:</span>
                  <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                    <span>{selectedTrip.rating}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                </div>
              )}
            </div>

            {selectedTrip.ratingFeedback && (
              <div className="bg-slate-950 p-2.5 rounded text-[11px] text-slate-300 italic border border-slate-800">
                "{selectedTrip.ratingFeedback}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
