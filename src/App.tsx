/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { AdminDispatchMap } from './components/AdminDispatchMap';
import { DynamicPricingEngine } from './components/DynamicPricingEngine';
import { PromotionNotifier } from './components/PromotionNotifier';
import { TripHistory } from './components/TripHistory';
import { DriverRatings } from './components/DriverRatings';
import { CloudArchitectureGuide } from './components/CloudArchitectureGuide';
import { GrowthStrategy } from './components/GrowthStrategy';
import {
  INITIAL_DRIVERS,
  INITIAL_ZONES,
  INITIAL_PRICING_RULES,
  INITIAL_TRIPS,
  INITIAL_CAMPAIGNS
} from './data/mockData';
import { Driver, PricingZone, PricingRule, Trip, PromotionCampaign, VehicleType } from './types/ubinow';
import {
  Smartphone,
  MapPin,
  TrendingUp,
  Bell,
  Star,
  Cloud,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('whatsapp-bot');
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [zones, setZones] = useState<PricingZone[]>(INITIAL_ZONES);
  const [pricingRules, setPricingRules] = useState<Record<VehicleType, PricingRule>>(INITIAL_PRICING_RULES);
  const [campaigns, setCampaigns] = useState<PromotionCampaign[]>(INITIAL_CAMPAIGNS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers for state updates across modules
  const handleNewTripCreated = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);

    // Mark driver as busy
    setDrivers((prev) =>
      prev.map((d) => (d.id === newTrip.driverId ? { ...d, status: 'busy' } : d))
    );

    showToast(`🚖 ¡Nuevo viaje creado por WhatsApp! #${newTrip.orderNumber} asignado a ${newTrip.driverName}`);
  };

  const handleZoneSurgeChange = (zoneId: string, newSurge: number) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, surgeMultiplier: newSurge } : z))
    );
    showToast(`⚡ Surge actualizado a x${newSurge} en zona`);
  };

  const handleUpdateRule = (vehicleType: VehicleType, updated: PricingRule) => {
    setPricingRules((prev) => ({
      ...prev,
      [vehicleType]: updated,
    }));
  };

  const handleBulkUpdateSurge = (delta: number) => {
    setZones((prev) =>
      prev.map((z) => ({
        ...z,
        surgeMultiplier: Number(Math.max(1.0, z.surgeMultiplier + delta).toFixed(2)),
      }))
    );
  };

  const handleDispatchManual = (driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    showToast(`Despacho manual enviado a ${driver.name} por WhatsApp`);
    setActiveTab('whatsapp-bot');
  };

  const handleSendCampaign = (campaign: PromotionCampaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
    showToast(`🔔 Alerta "${campaign.title}" transmitida a ${campaign.recipientsCount.toLocaleString()} usuarios`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header compliant with Top Bar Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickDemo={() => setActiveTab('whatsapp-bot')}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Secondary Sub-Navigation / Quick Context Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Módulo actual:</span>
            <span className="font-semibold text-white capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('growth-strategy')}
              className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === 'growth-strategy'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estrategia de Crecimiento 300%</span>
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {trips.length} viajes registrados · {drivers.filter((d) => d.status === 'available').length} choferes libres
            </span>
          </div>
        </div>

        {/* View Switcher */}
        {activeTab === 'whatsapp-bot' && (
          <WhatsAppSimulator
            drivers={drivers}
            zones={zones}
            pricingRules={pricingRules}
            onNewTripCreated={handleNewTripCreated}
          />
        )}

        {activeTab === 'admin-dispatch' && (
          <AdminDispatchMap
            zones={zones}
            drivers={drivers}
            trips={trips}
            onZoneSurgeChange={handleZoneSurgeChange}
            onDispatchManual={handleDispatchManual}
          />
        )}

        {activeTab === 'surge-pricing' && (
          <DynamicPricingEngine
            pricingRules={pricingRules}
            zones={zones}
            onUpdateRule={handleUpdateRule}
            onBulkUpdateSurge={handleBulkUpdateSurge}
          />
        )}

        {activeTab === 'promotions' && (
          <PromotionNotifier
            campaigns={campaigns}
            onSendCampaign={handleSendCampaign}
          />
        )}

        {activeTab === 'trip-history' && (
          <TripHistory trips={trips} />
        )}

        {activeTab === 'driver-quality' && (
          <DriverRatings drivers={drivers} />
        )}

        {activeTab === 'cloud-architecture' && (
          <CloudArchitectureGuide />
        )}

        {activeTab === 'growth-strategy' && (
          <GrowthStrategy onGoToSimulator={() => setActiveTab('whatsapp-bot')} />
        )}
      </main>

      {/* Real-time Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs max-w-md animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <p className="flex-1">{toastMessage}</p>
        </div>
      )}

      {/* Quiet Footer adhering to Anti-Slop Guidelines */}
      <footer className="mt-auto border-t border-slate-900 py-6 px-4 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Ubinow Mobility Technologies. Plataforma de despacho multicanal para Remis, Moto y Taxi.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>WhatsApp Business API</span>
            <span>·</span>
            <span>Tarifas Dinámicas Geohash</span>
            <span>·</span>
            <span>GCP / AWS Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
