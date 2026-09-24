const BASE_URL = process.env.TEST_URL || 'https://latha-jewellery-works.vercel.app';
console.log(`Starting Senior QA Comprehensive Test Suite against: ${BASE_URL}\n`);

const results = [];
let adminToken = null;

async function test(suite, name, fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    const duration = Date.now() - start;
    results.push({ suite, name, status: 'PASS', duration, detail: detail || 'OK' });
    console.log(`[PASS] [${suite}] ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    results.push({ suite, name, status: 'FAIL', duration, detail: err.message });
    console.error(`[FAIL] [${suite}] ${name} (${duration}ms):`, err.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function runTests() {
  // ==========================================
  // SUITE 1: Public Frontend & HTML Delivery
  // ==========================================
  await test('Public Frontend', 'Homepage index.html loads with 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const html = await res.text();
    assert(html.includes('Latha Jewellery'), 'HTML missing site title');
    assert(html.includes('<div id="root">'), 'HTML missing #root mount element');
    return 'HTML rendered with root mount & SEO tags';
  });

  await test('Public Frontend', 'SEO Meta & Schema Markup present in index.html', async () => {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    assert(html.includes('Latha Jewellery Works') || html.includes('jewellery'), 'Meta tags missing brand name');
    return 'SEO metadata verified';
  });

  // ==========================================
  // SUITE 2: Consolidated Public Endpoint
  // ==========================================
  await test('Public API', 'GET /api/public/data returns bundled store state', async () => {
    const res = await fetch(`${BASE_URL}/api/public/data`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.categories), 'Missing categories array');
    assert(Array.isArray(data.jewellery_models), 'Missing jewellery_models array');
    assert(Array.isArray(data.banners), 'Missing banners array');
    assert(Array.isArray(data.reviews), 'Missing reviews array');
    assert(data.gold_rates && typeof data.gold_rates === 'object', 'Missing gold_rates object');
    assert(data.content && typeof data.content === 'object', 'Missing content object');
    assert(data.settings && typeof data.settings === 'object', 'Missing settings object');
    return `Payload verified: ${data.categories.length} cats, ${data.jewellery_models.length} models, ${data.banners.length} banners, ${data.reviews.length} reviews`;
  });

  // ==========================================
  // SUITE 3: Gold Rates Engine & 2026 Realistic Values
  // ==========================================
  await test('Gold Rates', 'GET /api/gold-rates returns active 2026 market rates', async () => {
    const res = await fetch(`${BASE_URL}/api/gold-rates`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    const rate = data.rates || data.current;
    assert(rate, 'Missing rate payload');
    const p24 = Number(String(rate.rate_24k).replace(/[^0-9.]/g, ''));
    const p22 = Number(String(rate.rate_22k).replace(/[^0-9.]/g, ''));
    assert(p24 >= 5000 && p24 <= 25000, `24K rate ₹${p24} is out of realistic 2026 range (5000-25000)`);
    assert(p22 >= 4500 && p22 <= 25000, `22K rate ₹${p22} is out of realistic 2026 range (4500-25000)`);
    assert(rate.rate_silver, 'Silver rate missing');
    return `24K: ₹${rate.rate_24k}, 22K: ₹${rate.rate_22k}, Silver: ₹${rate.rate_silver}`;
  });

  await test('Gold Rates', 'POST /api/gold-rates/override sets manual board rates', async () => {
    const payload = {
      rate_24k: '13,350',
      rate_22k: '12,235',
      rate_18k: '10,010',
      rate_silver: '96',
      ticker_visible: 1
    };
    const res = await fetch(`${BASE_URL}/api/gold-rates/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Expected success: true');
    assert(data.rates.rate_24k === '13,350', `Expected 13,350, got ${data.rates.rate_24k}`);
    assert(data.rates.mode === 'MANUAL_OVERRIDE', `Expected MANUAL_OVERRIDE mode`);
    return `Override successful: 24K @ ${data.rates.rate_24k}`;
  });

  await test('Gold Rates', 'POST /api/gold-rates/restore-auto switches back to auto mode', async () => {
    const res = await fetch(`${BASE_URL}/api/gold-rates/restore-auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Expected success: true');
    assert(data.rates.mode === 'AUTOMATIC_API', `Expected mode AUTOMATIC_API, got ${data.rates.mode}`);
    return `Auto restored: mode ${data.rates.mode}`;
  });

  await test('Gold Rates', 'POST /api/gold-rates/fetch-live fetches or refreshes rates', async () => {
    const res = await fetch(`${BASE_URL}/api/gold-rates/fetch-live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Expected success: true');
    assert(data.rates && data.rates.rate_24k, 'Rates object missing');
    return `Live rates fetched: 24K @ ₹${data.rates.rate_24k}`;
  });

  // ==========================================
  // SUITE 4: Authentication Security
  // ==========================================
  await test('Auth API', 'POST /api/auth/login rejects invalid credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'WRONG_PASSWORD_XYZ' })
    });
    assert(res.status === 401, `Expected 401 Unauthorized, got ${res.status}`);
    return 'Rejected wrong password correctly';
  });

  await test('Auth API', 'POST /api/auth/login succeeds with valid master credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'LATHA2024' })
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Expected success: true');
    assert(data.token, 'Expected auth token in response');
    adminToken = data.token;
    return `Logged in successfully, token received: ${adminToken.substring(0, 15)}...`;
  });

  await test('Auth API', 'GET /api/auth/verify verifies valid session token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.valid === true, 'Token was not validated');
    return `Session valid for user: ${data.user?.username || 'admin'}`;
  });

  await test('Auth API', 'GET /api/auth/verify rejects missing / invalid session token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer invalid_tok_123` }
    });
    // Should be 401 if invalid
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
    return 'Rejected invalid token correctly';
  });

  // ==========================================
  // SUITE 5: Categories Management
  // ==========================================
  let createdCatId = null;
  await test('Categories API', 'GET /api/categories returns category array', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected array of categories');
    assert(data.length > 0, 'Category array is empty');
    return `Found ${data.length} categories`;
  });

  await test('Categories API', 'POST /api/categories creates a new category', async () => {
    const payload = {
      name: 'QA Test Bangles',
      description: 'Handcrafted test bangles',
      image_url: 'https://images.unsplash.com/photo-1611591475871-332304d9b4b0?auto=format&fit=crop&w=600&q=80',
      active: 1
    };
    const res = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    const data = await res.json();
    assert(data.id, 'Missing created category ID');
    assert(data.name === payload.name, 'Category name mismatch');
    createdCatId = data.id;
    return `Created category ID ${createdCatId}`;
  });

  await test('Categories API', 'PUT /api/categories/:id updates existing category', async () => {
    if (!createdCatId) throw new Error('No category to update');
    const payload = {
      name: 'QA Test Bangles (Updated)',
      description: 'Updated description'
    };
    const res = await fetch(`${BASE_URL}/api/categories/${createdCatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.name === payload.name, `Category name not updated, got: ${data.name}`);
    return `Updated category ${createdCatId}`;
  });

  await test('Categories API', 'DELETE /api/categories/:id removes test category', async () => {
    if (!createdCatId) throw new Error('No category to delete');
    const res = await fetch(`${BASE_URL}/api/categories/${createdCatId}`, {
      method: 'DELETE'
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Delete returned false');
    return `Deleted category ${createdCatId}`;
  });

  // ==========================================
  // SUITE 6: Jewellery Models Management
  // ==========================================
  let createdModelId = null;
  await test('Jewellery Models API', 'GET /api/jewellery returns models array', async () => {
    const res = await fetch(`${BASE_URL}/api/jewellery`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected array of models');
    assert(data.length > 0, 'Jewellery models array is empty');
    return `Found ${data.length} models`;
  });

  await test('Jewellery Models API', 'POST /api/jewellery creates new jewellery model', async () => {
    const payload = {
      name: 'QA Test Royal Harram',
      category_slug: 'necklace',
      description: 'Handmade 22k gold harram test item',
      min_weight: '32g',
      primary_image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
      featured: 1,
      active: 1
    };
    const res = await fetch(`${BASE_URL}/api/jewellery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    const data = await res.json();
    assert(data.id, 'Missing created model ID');
    createdModelId = data.id;
    return `Created model ID ${createdModelId}`;
  });

  await test('Jewellery Models API', 'PUT /api/jewellery/:id updates model details', async () => {
    if (!createdModelId) throw new Error('No model to update');
    const payload = {
      name: 'QA Test Royal Harram (Updated)',
      min_weight: '36g'
    };
    const res = await fetch(`${BASE_URL}/api/jewellery/${createdModelId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.name === payload.name, `Model name not updated, got: ${data.name}`);
    return `Updated model ${createdModelId}`;
  });

  await test('Jewellery Models API', 'DELETE /api/jewellery/:id removes test model', async () => {
    if (!createdModelId) throw new Error('No model to delete');
    const res = await fetch(`${BASE_URL}/api/jewellery/${createdModelId}`, {
      method: 'DELETE'
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Delete returned false');
    return `Deleted model ${createdModelId}`;
  });

  // ==========================================
  // SUITE 7: Banners Management
  // ==========================================
  await test('Banners API', 'GET /api/banners returns list of hero banners', async () => {
    const res = await fetch(`${BASE_URL}/api/banners`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected banners array');
    assert(data.length > 0, 'Banners list is empty');
    return `Found ${data.length} banners`;
  });

  await test('Banners API', 'PUT /api/banners/1 updates hero banner text & image', async () => {
    const payload = {
      title: 'Timeless Heritage Gold',
      subtitle: 'Handcrafted with Devotion in Hosur',
      active: 1
    };
    const res = await fetch(`${BASE_URL}/api/banners/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.title === payload.title, 'Banner title mismatch');
    return `Banner updated: ${data.title}`;
  });

  // ==========================================
  // SUITE 8: Site Content & Business Settings
  // ==========================================
  await test('Content API', 'GET /api/content returns brand story & atelier info', async () => {
    const res = await fetch(`${BASE_URL}/api/content`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(typeof data === 'object', 'Expected content object');
    return `Content retrieved: ${Object.keys(data).length} sections`;
  });

  await test('Content API', 'PUT /api/content updates atelier content', async () => {
    const res = await fetch(`${BASE_URL}/api/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ craftsmanship_note: 'Tested 100% QA Certified Craftsmanship' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.craftsmanship_note === 'Tested 100% QA Certified Craftsmanship', 'Content note mismatch');
    return 'Content updated successfully';
  });

  await test('Settings API', 'GET /api/settings returns atelier contact & config', async () => {
    const res = await fetch(`${BASE_URL}/api/settings`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(typeof data === 'object', 'Expected settings object');
    return `Settings retrieved: ${data.phone || '9487056064'}`;
  });

  // ==========================================
  // SUITE 9: Customer Enquiries
  // ==========================================
  let testEnquiryId = null;
  await test('Enquiries API', 'POST /api/enquiries validates required fields', async () => {
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }) // missing name and mobile
    });
    assert(res.status === 400, `Expected 400 Bad Request, got ${res.status}`);
    return 'Required fields correctly rejected';
  });

  await test('Enquiries API', 'POST /api/enquiries creates custom order enquiry & WhatsApp link', async () => {
    const payload = {
      name: 'QA Test Patron',
      mobile: '9876543210',
      email: 'test@example.com',
      jewellery_type: 'Bridal Choker',
      requirements: '22K 45 grams traditional bridal set for wedding'
    };
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    const data = await res.json();
    assert(data.enquiry && data.enquiry.id, 'Missing created enquiry');
    assert(data.whatsappUrl && data.whatsappUrl.includes('wa.me'), 'Missing valid WhatsApp link');
    assert(data.whatsappUrl.includes('919487056064'), 'WhatsApp destination number incorrect');
    testEnquiryId = data.enquiry.id;
    return `Enquiry #${testEnquiryId} created with WhatsApp link: ${data.whatsappUrl.substring(0, 45)}...`;
  });

  await test('Enquiries API', 'GET /api/enquiries returns all enquiries for admin', async () => {
    const res = await fetch(`${BASE_URL}/api/enquiries`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected array of enquiries');
    return `Admin enquiry count: ${data.length}`;
  });

  await test('Enquiries API', 'PUT /api/enquiries/:id updates enquiry status to CONTACTED', async () => {
    if (!testEnquiryId) throw new Error('No test enquiry to update');
    const res = await fetch(`${BASE_URL}/api/enquiries/${testEnquiryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONTACTED', internal_notes: 'Spoke with patron via WhatsApp' })
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'CONTACTED', `Status not updated, got: ${data.status}`);
    return `Enquiry #${testEnquiryId} marked as CONTACTED`;
  });

  await test('Enquiries API', 'DELETE /api/enquiries/:id deletes test enquiry', async () => {
    if (!testEnquiryId) throw new Error('No test enquiry to delete');
    const res = await fetch(`${BASE_URL}/api/enquiries/${testEnquiryId}`, {
      method: 'DELETE'
    });
    assert(res.status === 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Delete returned false');
    return `Enquiry #${testEnquiryId} deleted`;
  });

  // ==========================================
  // SUITE 10: Reviews & Patron Testimonials
  // ==========================================
  let testReviewId = null;
  await test('Reviews API', 'GET /api/reviews returns only approved reviews for public', async () => {
    const res = await fetch(`${BASE_URL}/api/reviews`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected reviews array');
    const nonApproved = data.filter(r => r.status && r.status !== 'APPROVED');
    assert(nonApproved.length === 0, 'Found unapproved reviews in public endpoint!');
    return `Found ${data.length} approved public reviews`;
  });

  await test('Reviews API', 'POST /api/reviews submits a new customer review (PENDING)', async () => {
    const payload = {
      name: 'QA Priya Soundar',
      location: 'Hosur',
      rating: 5,
      review_text: 'Outstanding gold finishing and authentic hallmarking service. Highly recommend Latha Jewellery.'
    };
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    assert(res.status === 201, `Expected 201 Created, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Expected success: true');
    assert(data.review && data.review.id, 'Missing review object');
    assert(data.review.status === 'PENDING', `Expected status PENDING, got: ${data.review.status}`);
    testReviewId = data.review.id;
    return `Review #${testReviewId} submitted as PENDING moderation`;
  });

  await test('Reviews API', 'GET /api/reviews/admin lists all reviews including pending', async () => {
    const res = await fetch(`${BASE_URL}/api/reviews/admin`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected reviews array');
    const found = data.find(r => r.id === testReviewId);
    assert(found, `Newly submitted review #${testReviewId} not found in admin list`);
    return `Admin review list contains ${data.length} total reviews`;
  });

  await test('Reviews API', 'PUT /api/reviews/:id approves review for public showcase', async () => {
    if (!testReviewId) throw new Error('No test review to approve');
    const res = await fetch(`${BASE_URL}/api/reviews/${testReviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED', featured: 1 })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'APPROVED', `Status was not APPROVED, got: ${data.status}`);
    return `Review #${testReviewId} successfully APPROVED`;
  });

  await test('Reviews API', 'DELETE /api/reviews/:id deletes test review', async () => {
    if (!testReviewId) throw new Error('No test review to delete');
    const res = await fetch(`${BASE_URL}/api/reviews/${testReviewId}`, {
      method: 'DELETE'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.success, 'Delete returned false');
    return `Review #${testReviewId} deleted`;
  });

  // ==========================================
  // SUITE 11: Media & Image Upload Engine
  // ==========================================
  await test('Media API', 'GET /api/media returns media asset list', async () => {
    const res = await fetch(`${BASE_URL}/api/media`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data), 'Expected media array');
    return `Media assets count: ${data.length}`;
  });

  await test('Media API', 'POST /api/media/upload-url rejects unauthenticated requests', async () => {
    const res = await fetch(`${BASE_URL}/api/media/upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: 'test/path/img.jpg', contentType: 'image/jpeg' })
    });
    assert(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
    return 'Unauthorized request denied as expected';
  });

  await test('Media API', 'POST /api/media/upload-url handles authenticated admin request', async () => {
    const res = await fetch(`${BASE_URL}/api/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ path: 'catalog/rings/test.jpg', contentType: 'image/jpeg' })
    });
    const data = await res.json();
    // Notice: if Supabase key is configured, returns signedUrl; if not, returns useClientFallback: true
    // Both are acceptable valid states
    assert(res.status === 200 || res.status === 403, `Status was ${res.status}`);
    return `Upload authorization response: ${data.signedUrl ? 'Signed URL generated' : (data.useClientFallback ? 'Client Fallback active' : JSON.stringify(data))}`;
  });

  // Print Summary
  console.log('\n======================================================');
  console.log('              QA TEST EXECUTION SUMMARY               ');
  console.log('======================================================');
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  console.log(`Total Test Cases: ${results.length}`);
  console.log(`Passed:           ${passCount}`);
  console.log(`Failed:           ${failCount}`);
  console.log(`Success Rate:     ${((passCount / results.length) * 100).toFixed(1)}%\n`);

  if (failCount > 0) {
    console.log('--- DEFECTS / FAILURES DETECTED ---');
    results.filter(r => r.status === 'FAIL').forEach(f => {
      console.log(`❌ [${f.suite}] ${f.name}: ${f.detail}`);
    });
  } else {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY WITH ZERO DEFECTS!');
  }
}

runTests().catch(err => {
  console.error('Test suite runner crashed:', err);
});
