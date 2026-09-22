import React, { useState, useEffect } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import SEO from './components/common/SEO';
import Preloader from './components/public/Preloader';
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

function parseCurrentRoute() {
  const path = window.location.pathname || '/';
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  const isAdmin = hash === '#admin' || hash === '#/admin' || hash.startsWith('#/admin') || search.includes('admin=true');

  if (path === '/collections' || path === '/collections/') {
    return { type: 'category', categorySlug: 'all', isAdmin };
  }
  if (path.startsWith('/collections/')) {
    const slug = path.replace(/^\/collections\//, '').replace(/\/$/, '').trim();
    return { type: 'category', categorySlug: slug || 'all', isAdmin };
  }
  if (path.startsWith('/product/')) {
    const productId = path.replace(/^\/product\//, '').replace(/\/$/, '').trim();
    return { type: 'category', categorySlug: 'all', productId, isAdmin };
  }

  // Legacy hash route support
  if (hash.startsWith('#/collections/')) {
    const slug = hash.replace('#/collections/', '').trim();
    return { type: 'category', categorySlug: slug || 'all', isAdmin };
  }
  if (hash === '#/collections') {
    return { type: 'category', categorySlug: 'all', isAdmin };
  }

  return { type: 'home', categorySlug: null, isAdmin };
}

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [adminRequested, setAdminRequested] = useState(() => parseCurrentRoute().isAdmin);
  const [route, setRoute] = useState(() => parseCurrentRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      const currentRoute = parseCurrentRoute();
      if (currentRoute.isAdmin) {
        setAdminRequested(true);
      }
      setRoute(currentRoute);
    };

    // Initial check
    handleRouteChange();

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('locationchange', handleRouteChange);

    // Keyboard shortcut Ctrl+Shift+A (or Cmd+Shift+A) for store owner
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminRequested((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('locationchange', handleRouteChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F9F6F0] flex flex-col relative selection:bg-accent-gold selection:text-[#121212]">
      {/* Luxury Website Preloader / Splash Screen */}
      <Preloader />

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
          <CategoryCataloguePage categorySlug={route.categorySlug} initialProductId={route.productId} />
        ) : (
          <>
            <SEO
              title="Latha Jewellery Works | Handcrafted 22K Gold & Silver Atelier Chathencode"
              description="Latha Jewellery Works (Est. 1990, Chathencode). Master goldsmiths crafting bespoke 22k gold harams, bridal suites, temple jewellery, valayal bangles, jimkis, and silver ornaments with live gold rates."
              canonicalUrl="https://latha-jewellery-works.vercel.app"
            />
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
