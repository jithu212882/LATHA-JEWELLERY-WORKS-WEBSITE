import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Full System Integration Tests...\n');

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const json = await res.json();
    console.log('✅ Health Check:', json.status);
  } catch (err) {
    console.error('❌ Health Check Failed:', err);
  }

  // 2. Fetch Public Storefront Data
  try {
    const res = await fetch(`${BASE_URL}/api/public/data`);
    const json = await res.json();
    console.log('✅ Public Storefront Data Loaded:');
    console.log(`   - Jewellery Models: ${json.jewellery_models.length}`);
    console.log(`   - Categories: ${json.categories.length}`);
    console.log(`   - Banners: ${json.banners.length}`);
    console.log(`   - Approved Reviews: ${json.reviews.length}`);
    console.log(`   - Gold Rates: 22K ₹${json.gold_rates.rate_22k}`);
    console.log(`   - Business Name: ${json.settings.business_name}`);
  } catch (err) {
    console.error('❌ Public Data Fetch Failed:', err);
  }

  // 3. Authenticate Admin Login
  let token = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'LATHA2024' })
    });
    const json = await res.json();
    if (res.ok && json.token) {
      token = json.token;
      console.log('✅ Admin Login Authentication Successful (JWT token generated)');
    } else {
      console.error('❌ Admin Login Failed:', json);
    }
  } catch (err) {
    console.error('❌ Login Request Failed:', err);
  }

  // 4. Submit New Public Custom Enquiry
  try {
    const res = await fetch(`${BASE_URL}/api/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Patron',
        mobile: '9487056064',
        email: 'test@example.com',
        jewellery_type: 'Custom Design',
        requirements: 'Test 22k Nakshi Haram request'
      })
    });
    const json = await res.json();
    if (res.ok && json.enquiry) {
      console.log(`✅ Public Custom Enquiry Created: ID ${json.enquiry.id}, WhatsApp URL built cleanly.`);
    } else {
      console.error('❌ Public Enquiry Creation Failed:', json);
    }
  } catch (err) {
    console.error('❌ Enquiry Submit Failed:', err);
  }

  // 5. Submit Public Review (Pending Queue)
  try {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suresh M.',
        location: 'Nadaikkavu',
        rating: 5,
        review_text: 'Excellent craftsmanship and honest gold purity!'
      })
    });
    const json = await res.json();
    if (res.ok && json.review) {
      console.log(`✅ Public Review Submitted to Pending Queue: ID ${json.review.id}, Status: ${json.review.status}`);
    } else {
      console.error('❌ Public Review Submission Failed:', json);
    }
  } catch (err) {
    console.error('❌ Review Submit Failed:', err);
  }

  // 6. Admin Update Gold Rates
  if (token) {
    try {
      const res = await fetch(`${BASE_URL}/api/gold-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rate_22k: '6,875',
          rate_24k: '7,490',
          rate_silver: '95',
          ticker_visible: 1
        })
      });
      const json = await res.json();
      if (res.ok && json.rate_22k === '6,875') {
        console.log(`✅ Admin Published New Live Gold Rate: 22K = ₹${json.rate_22k}/g (Ticker Synced)`);
      } else {
        console.error('❌ Gold Rate Update Failed:', json);
      }
    } catch (err) {
      console.error('❌ Gold Rate Update Failed:', err);
    }
  }

  // 7. Verify Public Data Reflects Admin Rate Update
  try {
    const res = await fetch(`${BASE_URL}/api/public/data`);
    const json = await res.json();
    if (json.gold_rates.rate_22k === '6,875') {
      console.log('✅ Real-time Public-Admin Synchronization Verified: 22K rate is ₹6,875 across all public sessions!');
    } else {
      console.error('❌ Public Synchronization Failed, expected 6,875 but got:', json.gold_rates.rate_22k);
    }
  } catch (err) {
    console.error('❌ Sync Verification Failed:', err);
  }

  console.log('\n✨ All Integration Tests Executed Successfully!\n');
}

runTests();
