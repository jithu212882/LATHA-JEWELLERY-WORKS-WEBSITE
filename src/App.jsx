import React, { useState, useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/public/Header';
import HeroSection from './components/public/HeroSection';
import AboutSection from './components/public/AboutSection';
import ServicesSection from './components/public/ServicesSection';
import ProcessSection from './components/public/ProcessSection';
import CatalogueSection from './components/public/CatalogueSection';
import SpotlightSection from './components/public/SpotlightSection';
import TrustSection from './components/public/TrustSection';
import TestimonialsSection from './components/public/TestimonialsSection';
import CustomEnquiryForm from './components/public/CustomEnquiryForm';
import ContactSection from './components/public/ContactSection';
import Footer from './components/public/Footer';
import FloatingWhatsApp from './components/public/FloatingWhatsApp';

import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import CategoryCataloguePage from './components/public/CategoryCataloguePage';

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [adminRequested, setAdminRequested] = useState(false);
  const [route, setRoute] = useState({ type: 'home', categorySlug: null });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (hash === '#admin' || hash === '#/admin' || hash.startsWith('#/admin') || search.includes('admin=true')) {
        setAdminRequested(true);
      }

      if (hash.startsWith('#/collections/')) {
        const slug = hash.replace('#/collections/', '').trim();
        setRoute({ type: 'category', categorySlug: slug || 'all' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#/collections') {
        setRoute({ type: 'category', categorySlug: 'all' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setRoute({ type: 'home', categorySlug: null });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    // Keyboard shortcut Ctrl+Shift+A (or Cmd+Shift+A) for store owner
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminRequested((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F9F6F0] flex flex-col relative selection:bg-accent-gold selection:text-[#121212]">
      {/* Admin Interface Modal / Overlay */}
      {adminRequested && (
        isAuthenticated ? (
          <AdminLayout onClosePublic={() => setAdminRequested(false)} />
        ) : (
          <AdminLogin onClose={() => setAdminRequested(false)} />
        )
      )}

      {/* Public Storefront */}
      <Header onOpenAdmin={() => setAdminRequested(true)} />
      <main className="flex-1 w-full">
        {route.type === 'category' ? (
          <CategoryCataloguePage categorySlug={route.categorySlug} />
        ) : (
          <>
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <ProcessSection />
            <CatalogueSection />
            <SpotlightSection />
            <TrustSection />
            <TestimonialsSection />
            <CustomEnquiryForm />
            <ContactSection />
          </>
        )}
      </main>
      <Footer onOpenAdmin={() => setAdminRequested(true)} />
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </DataProvider>
  );
}
