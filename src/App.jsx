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
import CategoryCataloguePage from './components/public/CategoryCataloguePage';

import { ensureHomeHistoryRoot, navigateTo } from './utils/navigation';

const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin'));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const ResetPasswordPage = React.lazy(() => import('./components/admin/ResetPasswordPage'));

function AdminLoadingScreen({ message = 'Verifying Atelier Access...' }) {
  return (
    <div className="fixed inset-0 z-[150] bg-[#0D0D0D] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-xl overflow-hidden border border-accent-gold/40 shadow-2xl bg-[#121212] p-0.5 mb-6">
        <img
          src="/assets/latha-jewellery-works-logo.jpeg"
          alt="Latha Jewellery Works"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="w-10 h-10 border-2 border-accent-gold/20 border-t-accent-gold rounded-full animate-spin mb-4" />
      <span className="font-headline text-accent-gold text-sm tracking-widest uppercase">
        {message}
      </span>
      <span className="text-[11px] text-[#F5F2EB]/40 mt-1 uppercase tracking-widest font-mono">
        Latha Jewellery Works • Est. 1990
      </span>
    </div>
  );
}

function parseCurrentRoute() {
  const path = window.location.pathname || '/';
  const hash = window.location.hash || '';
  const search = window.location.search || '';

  // 1. Dedicated Admin Paths
  if (path === '/admin/login' || path === '/admin/login/') {
    return { type: 'admin-login' };
  }
  if (path === '/admin/reset-password' || path === '/admin/reset-password/') {
    return { type: 'admin-reset-password' };
  }
  if (
    path === '/admin/dashboard' ||
    path === '/admin/dashboard/' ||
    path === '/admin' ||
    path === '/admin/'
  ) {
    return { type: 'admin-dashboard' };
  }

  // 2. Legacy admin hash or search flag
  if (
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#/admin') ||
    search.includes('admin=true')
  ) {
    return { type: 'admin-legacy' };
  }

  // 3. Public Collections and Product pages
  if (path === '/collections' || path === '/collections/') {
    return { type: 'category', categorySlug: 'all' };
  }
  if (path.startsWith('/collections/')) {
    const slug = path.replace(/^\/collections\//, '').replace(/\/$/, '').trim();
    return { type: 'category', categorySlug: slug || 'all' };
  }
  if (path.startsWith('/product/')) {
    const productId = path.replace(/^\/product\//, '').replace(/\/$/, '').trim();
    return { type: 'category', categorySlug: 'all', productId };
  }

  // 4. Legacy hash collections
  if (hash.startsWith('#/collections/')) {
    const slug = hash.replace('#/collections/', '').trim();
    return { type: 'category', categorySlug: slug || 'all' };
  }
  if (hash === '#/collections') {
    return { type: 'category', categorySlug: 'all' };
  }

  // 5. Default Public Homepage
  return { type: 'home', categorySlug: null };
}

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [route, setRoute] = useState(() => parseCurrentRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      ensureHomeHistoryRoot();
      setRoute(parseCurrentRoute());
    };

    handleRouteChange();

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('locationchange', handleRouteChange);

    // Keyboard shortcut Ctrl+Shift+A (or Cmd+Shift+A) for store owner
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAuthenticated) {
          navigateTo('/admin/dashboard');
        } else {
          navigateTo('/admin/login');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('locationchange', handleRouteChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated]);

  // Route Guards for admin pages
  useEffect(() => {
    if (isLoading) return; // Wait until initial session restore completes

    if (route.type === 'admin-legacy') {
      if (isAuthenticated) {
        navigateTo('/admin/dashboard');
      } else {
        navigateTo('/admin/login');
      }
    } else if (route.type === 'admin-dashboard' && !isAuthenticated) {
      navigateTo('/admin/login');
    } else if (route.type === 'admin-login' && isAuthenticated) {
      navigateTo('/admin/dashboard');
    }
  }, [route.type, isAuthenticated, isLoading]);

  // View: Admin Reset Password Page
  if (route.type === 'admin-reset-password') {
    return (
      <React.Suspense fallback={<AdminLoadingScreen message="Loading Password Recovery..." />}>
        <ResetPasswordPage
          onComplete={() => navigateTo('/admin/dashboard')}
          onCancel={() => navigateTo('/admin/login')}
        />
      </React.Suspense>
    );
  }

  // View: Admin Login Page
  if (route.type === 'admin-login') {
    if (isLoading) {
      return <AdminLoadingScreen message="Checking Atelier Session..." />;
    }
    if (isAuthenticated) {
      return <AdminLoadingScreen message="Entering Atelier Dashboard..." />;
    }
    return (
      <React.Suspense fallback={<AdminLoadingScreen message="Loading Admin Access..." />}>
        <AdminLogin
          onClose={() => navigateTo('/')}
          onSuccess={() => navigateTo('/admin/dashboard')}
        />
      </React.Suspense>
    );
  }

  // View: Admin Protected Dashboard
  if (route.type === 'admin-dashboard' || route.type === 'admin-legacy') {
    if (isLoading) {
      return <AdminLoadingScreen message="Verifying Atelier Studio Access..." />;
    }
    if (!isAuthenticated) {
      return <AdminLoadingScreen message="Redirecting to Login..." />;
    }
    return (
      <React.Suspense fallback={<AdminLoadingScreen message="Opening Atelier Studio..." />}>
        <AdminLayout onClosePublic={() => navigateTo('/')} />
      </React.Suspense>
    );
  }

  // View: Public Storefront
  return (
    <div className="min-h-screen bg-[#121212] text-[#F9F6F0] flex flex-col relative selection:bg-accent-gold selection:text-[#121212]">
      {/* Luxury Website Preloader / Splash Screen */}
      <Preloader />

      {/* Public Storefront Header */}
      <Header />

      <main className="flex-1 w-full">
        {route.type === 'category' ? (
          <CategoryCataloguePage
            categorySlug={route.categorySlug}
            initialProductId={route.productId}
          />
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

      <Footer />
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
