import React, { useState } from 'react';
import {
  Sliders,
  Zap,
  CloudRain,
  Moon,
  Clock,
  Car,
  Bike,
  Shield,
  CheckCircle,
  HelpCircle,
  Calculator,
  RefreshCw
} from 'lucide-react';
import { PricingRule, VehicleType, PricingZone } from '../types/ubinow';

interface DynamicPricingEngineProps {
  pricingRules: Record<VehicleType, PricingRule>;
  zones: PricingZone[];
  onUpdateRule: (vehicleType: VehicleType, updated: PricingRule) => void;
  onBulkUpdateSurge: (multiplierDelta: number) => void;
}

export const DynamicPricingEngine: React.FC<DynamicPricingEngineProps> = ({
  pricingRules,
  zones,
  onUpdateRule,
  onBulkUpdateSurge,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('remis');
  const [testDistanceKm, setTestDistanceKm] = useState<number>(6.5);
  const [testDurationMin, setTestDurationMin] = useState<number>(20);
  const [isRainSurgeActive, setIsRainSurgeActive] = useState<boolean>(false);
  const [isNightSurchargeActive, setIsNightSurchargeActive] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const currentRule = pricingRules[selectedVehicle];

  const handleFieldChange = (field: keyof PricingRule, value: number) => {
    onUpdateRule(selectedVehicle, {
      ...currentRule,
      [field]: value,
    });
    setSaveSuccessMessage(`Tarifa de ${selectedVehicle.toUpperCase()} actualizada en tiempo real`);
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  // Weather & night surge factors
  const weatherFactor = isRainSurgeActive ? 1.25 : 1.0;
  const nightFactor = isNightSurchargeActive ? 1.20 : 1.0;
  const avgZoneSurge = zones.reduce((a, b) => a + b.surgeMultiplier, 0) / zones.length;
  const combinedSurgeMultiplier = Number((avgZoneSurge * weatherFactor * nightFactor).toFixed(2));

  // Calculation formula
  const baseTripCost =
    currentRule.baseFare +
    testDistanceKm * currentRule.perKm +
    testDurationMin * currentRule.perMinute;

  const finalEstimatedPrice = Math.max(
    currentRule.minimumFare,
    Math.round((baseTripCost * combinedSurgeMultiplier) / 50) * 50
  );

  const ubinowCommission = Math.round(
    finalEstimatedPrice * (currentRule.commissionPercentage / 100)
  );
  const driverEarnings = finalEstimatedPrice - ubinowCommission;

  return (
    <div className="space-y-6">
      {/* Overview & Concept banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Motor Algorítmico de Tarifas Dinámicas (Surge Pricing Engine)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo por Geohash y densidad de pedidos en tiempo real para Remis, Moto y Taxi
            </p>
          </div>

          {/* Quick weather / night toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRainSurgeActive(!isRainSurgeActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isRainSurgeActive
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Modo Lluvia (+25% Surge)</span>
            </button>

            <button
              onClick={() => setIsNightSurchargeActive(!isNightSurchargeActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isNightSurchargeActive
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Tarifa Nocturna (+20%)</span>
            </button>
          </div>
        </div>

        {saveSuccessMessage && (
          <div className="mt-3 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Parameters Configuration */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">
              Reglas de Facturación Base
            </h3>

            {/* Vehicle Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setSelectedVehicle('remis')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  selectedVehicle === 'remis'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Remis</span>
              </button>
              <button
                onClick={() => setSelectedVehicle('moto')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  selectedVehicle === 'moto'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Moto</span>
              </button>
              <button
                onClick={() => setSelectedVehicle('taxi')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  selectedVehicle === 'taxi'
                    ? 'bg-amber-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Taxi</span>
              </button>
            </div>
          </div>

          {/* Sliders for current vehicle */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Bajada de Bandera / Tarifa Base</span>
                <span className="font-mono text-emerald-400 font-bold">${currentRule.baseFare} ARS</span>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="50"
                value={currentRule.baseFare}
                onChange={(e) => handleFieldChange('baseFare', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>$500</span>
                <span>$1,750</span>
                <span>$3,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Costo por Kilómetro Recorrido</span>
                <span className="font-mono text-emerald-400 font-bold">${currentRule.perKm} ARS / km</span>
              </div>
              <input
                type="range"
                min="150"
                max="800"
                step="10"
                value={currentRule.perKm}
                onChange={(e) => handleFieldChange('perKm', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>$150/km</span>
                <span>$475/km</span>
                <span>$800/km</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Costo por Minuto de Viaje / Espera</span>
                <span className="font-mono text-emerald-400 font-bold">${currentRule.perMinute} ARS / min</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={currentRule.perMinute}
                onChange={(e) => handleFieldChange('perMinute', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>$20/min</span>
                <span>$85/min</span>
                <span>$150/min</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Tarifa Mínima Garantizada</span>
                <span className="font-mono text-emerald-400 font-bold">${currentRule.minimumFare} ARS</span>
              </div>
              <input
                type="range"
                min="800"
                max="4000"
                step="100"
                value={currentRule.minimumFare}
                onChange={(e) => handleFieldChange('minimumFare', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Comisión Plataforma Ubinow (%)</span>
                <span className="font-mono text-blue-400 font-bold">{currentRule.commissionPercentage}%</span>
              </div>
              <input
                type="range"
                min="8"
                max="25"
                step="1"
                value={currentRule.commissionPercentage}
                onChange={(e) => handleFieldChange('commissionPercentage', Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                El <strong>{100 - currentRule.commissionPercentage}%</strong> restante se acredita instantáneamente al conductor.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Live Simulator & Cost Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Simulador de Cotización en Tiempo Real</span>
            </h3>

            {/* Test Trip Sliders */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <label className="text-slate-400 block mb-1">Distancia estimada</label>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    step="0.5"
                    value={testDistanceKm}
                    onChange={(e) => setTestDistanceKm(Math.max(0.5, Number(e.target.value)))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                  <span className="text-slate-400 font-mono">km</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <label className="text-slate-400 block mb-1">Duración del trayecto</label>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    step="1"
                    value={testDurationMin}
                    onChange={(e) => setTestDurationMin(Math.max(1, Number(e.target.value)))}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                  />
                  <span className="text-slate-400 font-mono">min</span>
                </div>
              </div>
            </div>

            {/* Calculation Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Costo base lineal:</span>
                <span className="font-mono text-slate-200">${Math.round(baseTripCost)} ARS</span>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Multiplicador Surge Efectivo:</span>
                <span className="font-mono text-amber-400 font-semibold">
                  x{combinedSurgeMultiplier}
                  {isRainSurgeActive && ' (Lluvia)'}
                  {isNightSurchargeActive && ' (Noche)'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-white">Tarifa Final al Pasajero:</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  ${finalEstimatedPrice.toLocaleString()} <span className="text-xs text-slate-400">ARS</span>
                </span>
              </div>

              {/* Commission breakdown */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Ingreso Chofer (85%)</div>
                  <div className="font-mono font-semibold text-white">
                    ${driverEarnings.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400">Comisión Ubinow (15%)</div>
                  <div className="font-mono font-semibold text-emerald-400">
                    ${ubinowCommission.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
              💡 <strong>Regla de Oferta/Demanda:</strong> Cuando la relación de pedidos activos sobre choferes disponibles en un hexágono H3 supera 1.8x, el motor incrementa automáticamente el surge cada 90 segundos para atraer más choferes a la zona.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
