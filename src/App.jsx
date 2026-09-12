import React, { useState } from 'react';
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

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [adminRequested, setAdminRequested] = useState(false);

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
