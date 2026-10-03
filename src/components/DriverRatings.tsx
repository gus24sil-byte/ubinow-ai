import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  AlertTriangle,
  Award,
  ThumbsUp,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Driver, DriverRatingFeedback } from '../types/ubinow';
import { INITIAL_RATINGS } from '../data/mockData';

interface DriverRatingsProps {
  drivers: Driver[];
}

export const DriverRatings: React.FC<DriverRatingsProps> = ({ drivers }) => {
  const [feedbackList, setFeedbackList] = useState<DriverRatingFeedback[]>(INITIAL_RATINGS);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // Fleet rating aggregates
  const avgRating = (
    drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length
  ).toFixed(2);
  const totalTripsReviewed = drivers.reduce((acc, d) => acc + d.totalTrips, 0);

  // Filtered feedback
  const filteredFeedbacks = feedbackList.filter((f) => {
    const matchesTag = selectedTag === 'all' || f.tags.includes(selectedTag);
    const matchesRating = minRatingFilter === 0 || f.stars === minRatingFilter;
    return matchesTag && matchesRating;
  });

  // Drivers needing attention (rating < 4.80)
  const driversUnderReview = drivers.filter((d) => d.rating < 4.80);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Sistema de Calificaciones & Aseguramiento de Calidad</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Retroalimentación bidireccional automática tras cada viaje por WhatsApp y App para mantener el estándar de servicio
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Promedio de Flota</div>
              <div className="text-xl font-bold font-mono text-amber-400 flex items-center gap-1 justify-end">
                <span>{avgRating}</span>
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Satisfacción de Pasajeros</span>
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            96.8%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Calificaciones de 4 y 5 estrellas
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Evaluaciones</span>
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalTripsReviewed.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Acumuladas en la plataforma
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Conductores Verificados</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {drivers.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Documentación y antecedentes al día
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Alertas de Calidad (&lt; 4.8★)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {driversUnderReview.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Bajo observación preventiva
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Driver Leaderboard & Quality Audit */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center justify-between border-b border-slate-800 pb-3">
            <span>Ranking & Desempeño de Conductores</span>
            <Award className="w-4 h-4 text-amber-400" />
          </h3>

          <div className="space-y-3">
            {drivers
              .sort((a, b) => b.rating - a.rating)
              .map((driver, index) => (
                <div
                  key={driver.id}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
                        #{index + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{driver.name}</h4>
                        <p className="text-[11px] text-slate-400">
                          {driver.vehicleModel} · {driver.vehicleType.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
                        <span>{driver.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {driver.totalTrips} viajes
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1">
                    {driver.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Quality intervention status */}
                  {driver.rating < 4.80 ? (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Alerta de calidad: Notificación de feedback enviada por WhatsApp al chofer.</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      <span>Conductor Destacado Ubinow Premier</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right Column: Customer Feedback Feed & Review Stream */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">
              Opiniones Recientes de Pasajeros
            </h3>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setMinRatingFilter(0)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  minRatingFilter === 0 ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setMinRatingFilter(5)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  minRatingFilter === 5 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                }`}
              >
                5★
              </button>
              <button
                onClick={() => setMinRatingFilter(4)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  minRatingFilter === 4 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                }`}
              >
                4★
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFeedbacks.map((f) => (
              <div
                key={f.id}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white">{f.customerName}</span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      → Viajó con <strong>{f.driverName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-mono text-xs">
                    <span>{f.stars}</span>
                    <Star className="w-3 h-3 fill-amber-400" />
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{f.comment}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {f.tags.map((t) => (
                      <span key={t} className="bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <span>{f.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
