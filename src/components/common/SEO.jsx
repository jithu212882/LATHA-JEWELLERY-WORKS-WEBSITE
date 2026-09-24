import React, { useEffect } from 'react';

export default function SEO({
  title = 'Latha Jewellery Works | Handcrafted 22K Gold & Silver Atelier Chathencode',
  description = 'Latha Jewellery Works (Est. 1990, Chathencode). Master goldsmiths crafting bespoke 22k gold harams, bridal suites, temple jewellery, valayal bangles, jimkis, and silver ornaments with live gold rates.',
  keywords = 'Latha Jewellery Works, Chathencode gold shop, 22k gold jewellery, temple jewellery, bridal haram, gold bangles, jimki earrings, gold rate Chathencode, custom gold ornaments',
  canonicalUrl = 'https://latha-jewellery-works.vercel.app',
  ogImage = 'https://latha-jewellery-works.vercel.app/assets/latha-jewellery-works-logo.jpeg',
  ogType = 'website',
  productSchema = null,
  breadcrumbs = []
}) {
  const fullTitle = title.includes('Latha Jewellery')
    ? title
    : `${title} | Latha Jewellery Works Chathencode`;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMetaTag = (attr, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update canonical link
    const setCanonical = (url) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    // 2. Set Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', 'index, follow');
    setMetaTag('name', 'author', 'Latha Jewellery Works');

    // 3. OpenGraph Meta Tags
    setMetaTag('property', 'og:site_name', 'Latha Jewellery Works');
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);

    // 4. Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 5. Canonical Link
    setCanonical(canonicalUrl);

    // 6. Inject LocalBusiness / JewelryStore JSON-LD Structured Data
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'JewelryStore',
      'name': 'Latha Jewellery Works',
      'image': ogImage,
      '@id': 'https://latha-jewellery-works.vercel.app/#store',
      'url': 'https://latha-jewellery-works.vercel.app',
      'telephone': '+91-94870-56064',
      'email': 'lathajewelleryworks@gmail.com',
      'priceRange': '₹₹₹',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Main Road, Chathencode',
        'addressLocality': 'Chathencode',
        'addressRegion': 'Tamil Nadu',
        'postalCode': '629153',
        'addressCountry': 'IN'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 8.3245,
        'longitude': 77.2189
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        'opens': '09:00',
        'closes': '20:00'
      },
      'sameAs': [
        'https://wa.me/919487056064'
      ]
    };

    let jsonLdScript = document.getElementById('jsonld-localbusiness');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'jsonld-localbusiness';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(localBusinessSchema);

    // 7. Inject Breadcrumbs JSON-LD if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((bc, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': bc.name,
          'item': bc.url
        }))
      };

      let bcScript = document.getElementById('jsonld-breadcrumbs');
      if (!bcScript) {
        bcScript = document.createElement('script');
        bcScript.id = 'jsonld-breadcrumbs';
        bcScript.type = 'application/ld+json';
        document.head.appendChild(bcScript);
      }
      bcScript.textContent = JSON.stringify(breadcrumbSchema);
    }

    // 8. Inject Product JSON-LD if provided
    if (productSchema) {
      let prodScript = document.getElementById('jsonld-product');
      if (!prodScript) {
        prodScript = document.createElement('script');
        prodScript.id = 'jsonld-product';
        prodScript.type = 'application/ld+json';
        document.head.appendChild(prodScript);
      }
      prodScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': productSchema.name,
        'image': productSchema.image || ogImage,
        'description': productSchema.description || description,
        'brand': {
          '@type': 'Brand',
          'name': 'Latha Jewellery Works'
        },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'JewelryStore',
            'name': 'Latha Jewellery Works'
          }
        }
      });
    }

  }, [fullTitle, description, keywords, canonicalUrl, ogImage, ogType, productSchema, breadcrumbs]);

  return null;
}
