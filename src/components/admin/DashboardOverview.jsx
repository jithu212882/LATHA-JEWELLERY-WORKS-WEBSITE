import React from 'react';
import { useData } from '../../context/DataContext';

export default function DashboardOverview({ onSwitchTab }) {
  const { jewellery_models, categories, reviews, gold_rates } = useData();

  const totalModels = jewellery_models ? jewellery_models.length : 0;
  const totalCategories = categories ? categories.length : 0;
  const pendingReviews = (reviews || []).filter(r => r.status === 'PENDING').length;
  const currentGoldRate = gold_rates ? gold_rates.rate_22k : '6,875';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Executive Command Center
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Studio Command Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onSwitchTab('models')}
            className="bg-accent-gold text-[#121212] font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors"
          >
            + Add Model
          </button>
          <button
            onClick={() => onSwitchTab('gold')}
            className="bg-[#1C1B1A] border border-[#2A2A2A] text-[#F9F6F0] px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:border-accent-gold transition-colors"
          >
            Update Gold Rates
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <span className="material-symbols-outlined absolute top-4 right-4 text-accent-gold/20 text-4xl">
            diamond
          </span>
          <span className="text-xs text-[#F5F2EB]/60 uppercase tracking-wider font-medium">
            Jewellery Models
          </span>
          <div className="text-3xl font-headline font-bold text-accent-gold mt-2">
            {totalModels}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block">
            {totalCategories} active categories
          </span>
        </div>

        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <span className="material-symbols-outlined absolute top-4 right-4 text-accent-gold/20 text-4xl">
            reviews
          </span>
          <span className="text-xs text-[#F5F2EB]/60 uppercase tracking-wider font-medium">
            Pending Reviews
          </span>
          <div className="text-3xl font-headline font-bold text-accent-gold mt-2">
            {pendingReviews}
          </div>
          <span className="text-[11px] text-amber-400 mt-2 block">
            {pendingReviews > 0 ? 'Requires admin approval' : 'All reviews moderated'}
          </span>
        </div>

        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <span className="material-symbols-outlined absolute top-4 right-4 text-accent-gold/20 text-4xl">
            trending_up
          </span>
          <span className="text-xs text-[#F5F2EB]/60 uppercase tracking-wider font-medium">
            22K Gold Rate (1g)
          </span>
          <div className="text-3xl font-headline font-bold text-accent-gold mt-2">
            ₹{currentGoldRate}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block">
            {gold_rates?.last_updated || 'Updated today'}
          </span>
        </div>

        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl relative overflow-hidden shadow-lg">
          <span className="material-symbols-outlined absolute top-4 right-4 text-accent-gold/20 text-4xl">
            chat
          </span>
          <span className="text-xs text-[#F5F2EB]/60 uppercase tracking-wider font-medium">
            WhatsApp Enquiries
          </span>
          <div className="text-3xl font-headline font-bold text-accent-gold mt-2">
            Active
          </div>
          <span className="text-[11px] text-accent-gold mt-2 block">
            Connected to 9487056064
          </span>
        </div>
      </div>

      {/* Studio Status & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl shadow-lg">
          <h3 className="font-headline text-xl text-accent-gold font-bold uppercase tracking-wider mb-4">
            Quick Actions & Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => onSwitchTab('models')}
              className="p-4 bg-[#121212] border border-[#2A2A2A] rounded-xl hover:border-accent-gold transition-colors text-left flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-accent-gold">diamond</span>
              <div>
                <h4 className="font-bold text-[#F9F6F0] text-sm">Manage Catalogue</h4>
                <p className="text-xs text-[#F5F2EB]/60">Add, edit, or remove jewellery models</p>
              </div>
            </button>

            <button
              onClick={() => onSwitchTab('enquiries')}
              className="p-4 bg-[#121212] border border-[#2A2A2A] rounded-xl hover:border-accent-gold transition-colors text-left flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-accent-gold">inbox</span>
              <div>
                <h4 className="font-bold text-[#F9F6F0] text-sm">Customer Enquiries</h4>
                <p className="text-xs text-[#F5F2EB]/60">View & track custom order requests</p>
              </div>
            </button>

            <button
              onClick={() => onSwitchTab('media')}
              className="p-4 bg-[#121212] border border-[#2A2A2A] rounded-xl hover:border-accent-gold transition-colors text-left flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-accent-gold">perm_media</span>
              <div>
                <h4 className="font-bold text-[#F9F6F0] text-sm">Media Library</h4>
                <p className="text-xs text-[#F5F2EB]/60">Upload & organize photos</p>
              </div>
            </button>

            <button
              onClick={() => onSwitchTab('reviews')}
              className="p-4 bg-[#121212] border border-[#2A2A2A] rounded-xl hover:border-accent-gold transition-colors text-left flex items-center gap-3"
            >
              <span className="material-symbols-outlined text-accent-gold">rate_review</span>
              <div>
                <h4 className="font-bold text-[#F9F6F0] text-sm">Moderate Reviews</h4>
                <p className="text-xs text-[#F5F2EB]/60">Approve public patron reviews</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-xl text-accent-gold font-bold uppercase tracking-wider mb-4">
              Atelier Status
            </h3>
            <ul className="space-y-3 text-xs text-[#F5F2EB]/80 font-medium">
              <li className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A]">
                <span className="uppercase">Storefront Data Sync</span>
                <span className="text-emerald-400 font-bold">Real-time</span>
              </li>
              <li className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A]">
                <span className="uppercase">Database Storage</span>
                <span className="text-emerald-400 font-bold">SQLite Store</span>
              </li>
              <li className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A]">
                <span className="uppercase">Gold Rate Ticker</span>
                <span className="text-emerald-400 font-bold">Live</span>
              </li>
              <li className="flex justify-between items-center py-1.5 border-b border-[#2A2A2A]">
                <span className="uppercase">WhatsApp API</span>
                <span className="text-emerald-400 font-bold">+91 9487056064</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-6 border-t border-[#2A2A2A] text-center">
            <span className="text-[11px] text-[#F5F2EB]/50">
              Latha Jewellery Works Admin Studio v5.0 Enterprise
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
