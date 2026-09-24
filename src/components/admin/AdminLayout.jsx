import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import DashboardOverview from './DashboardOverview';
import JewelleryManager from './JewelleryManager';
import CategoryManager from './CategoryManager';
import EnquiryManager from './EnquiryManager';
import BannerManager from './BannerManager';
import MediaLibrary from './MediaLibrary';
import GoldRateManager from './GoldRateManager';
import ReviewManager from './ReviewManager';
import ContentManager from './ContentManager';
import BusinessSettingsManager from './BusinessSettingsManager';

export default function AdminLayout({ onClosePublic }) {
  const { user, logout } = useAuth();
  const { reviews } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingReviewsCount = (reviews || []).filter(r => r.status === 'PENDING').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'models', label: 'Jewellery Models', icon: 'diamond' },
    { id: 'categories', label: 'Categories', icon: 'category' },
    { id: 'enquiries', label: 'Customer Enquiries', icon: 'inbox' },
    { id: 'banners', label: 'Banners & Hero', icon: 'view_carousel' },
    { id: 'media', label: 'Media Library', icon: 'perm_media' },
    { id: 'gold', label: 'Gold Rates', icon: 'trending_up' },
    { id: 'reviews', label: 'Reviews Moderation', icon: 'rate_review', badge: pendingReviewsCount },
    { id: 'content', label: 'Site Content', icon: 'edit_document' },
    { id: 'settings', label: 'Business & SEO', icon: 'settings' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] flex flex-col text-[#F5F2EB]">
      {/* Top Admin Navigation Header */}
      <header className="h-16 bg-[#0D0D0D] border-b border-[#2A2A2A] px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden text-[#F5F2EB] hover:text-accent-gold p-1"
            aria-label="Toggle Navigation Drawer"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-headline font-bold text-accent-gold uppercase tracking-widest text-sm sm:text-base">
              Latha Jewellery Studio
            </span>
            <span className="text-[10px] bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded font-mono font-bold hidden sm:inline">
              v5.0 Enterprise
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onClosePublic}
            className="text-xs text-[#F5F2EB]/70 hover:text-accent-gold uppercase tracking-wider flex items-center gap-1 bg-[#181818] border border-[#2A2A2A] px-3 py-1.5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span className="hidden sm:inline">Public Storefront</span>
          </button>

          <div className="flex items-center gap-3 border-l border-[#2A2A2A] pl-4">
            <div className="w-8 h-8 rounded-full bg-accent-gold text-[#121212] flex items-center justify-center font-bold text-xs shadow-md shrink-0">
              {user?.email?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'L'}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-[#F9F6F0] truncate max-w-[140px]">
                {user?.email || user?.username || 'Administrator'}
              </span>
              <span className="text-[10px] text-accent-gold/80 font-mono uppercase mt-0.5">
                {user?.role || 'Admin'}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors text-xs font-semibold uppercase tracking-wider"
              title="Sign Out of Atelier Studio"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          />
        )}

        {/* Sidebar Drawer Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col justify-between shrink-0 transform transition-transform duration-300 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="py-4 space-y-1 overflow-y-auto px-3">
            <div className="px-3 pb-3 border-b border-[#2A2A2A] mb-3 flex items-center justify-between">
              <span className="text-[10px] text-accent-gold uppercase tracking-widest font-bold">
                Control Panels
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="lg:hidden text-[#F5F2EB]/60 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30 shadow-md'
                    : 'text-[#F5F2EB]/70 hover:text-[#F9F6F0] hover:bg-[#181818]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 ? (
                  <span className="px-2 py-0.5 bg-amber-500 text-[#121212] font-bold text-[10px] rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-[#2A2A2A]">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-[#181818] border border-[#2A2A2A] text-red-300 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/30 transition-colors font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign Out / Lock Studio
            </button>
          </div>
        </aside>

        {/* Content View Panel */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#121212] w-full">
          {activeTab === 'overview' && <DashboardOverview onSwitchTab={setActiveTab} />}
          {activeTab === 'models' && <JewelleryManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'enquiries' && <EnquiryManager />}
          {activeTab === 'banners' && <BannerManager />}
          {activeTab === 'media' && <MediaLibrary />}
          {activeTab === 'gold' && <GoldRateManager />}
          {activeTab === 'reviews' && <ReviewManager />}
          {activeTab === 'content' && <ContentManager />}
          {activeTab === 'settings' && <BusinessSettingsManager />}
        </main>
      </div>
    </div>
  );
}
