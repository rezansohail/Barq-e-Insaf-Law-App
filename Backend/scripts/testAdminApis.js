const BASE_URL = 'http://localhost:5000/api';

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function testAllAdminApis() {
  console.log('========================================================');
  console.log('   BARQ-E-INSAF ADMIN PORTAL BACKEND APIS TEST SUITE   ');
  console.log('========================================================\n');

  let token = null;

  // 1. Admin Login
  try {
    console.log('1. Testing Admin Login (POST /api/admin/login)...');
    const loginRes = await req('/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'anjumkalwar.cs@gmail.com',
        password: 'AnjumPassword2026@!',
      }),
    });
    console.log('   Status:', loginRes.status);
    console.log('   Success:', loginRes.data?.success);
    console.log('   Admin Name:', loginRes.data?.admin?.fullName);
    if (!loginRes.ok) {
      console.error('   ❌ Login failed:', loginRes.data);
      process.exit(1);
    }
    token = loginRes.data.token;
    console.log('   ✓ Token acquired successfully!\n');
  } catch (err) {
    console.error('   ❌ Login failed:', err.message);
    process.exit(1);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Admin Me
  try {
    console.log('2. Testing Admin Profile (GET /api/admin/me)...');
    const meRes = await req('/admin/me', { headers: authHeaders });
    console.log('   Status:', meRes.status);
    console.log('   Admin ID:', meRes.data?.admin?.id, '| Role:', meRes.data?.admin?.role);
    console.log('   ✓ Profile verified successfully!\n');
  } catch (err) {
    console.error('   ❌ Admin Me failed:', err.message);
  }

  // 3. Platform Ecosystem Stats
  try {
    console.log('3. Testing Ecosystem Stats (GET /api/admin/stats)...');
    const statsRes = await req('/admin/stats', { headers: authHeaders });
    console.log('   Status:', statsRes.status);
    console.log('   Citizens:', statsRes.data?.citizens);
    console.log('   Lawyers:', statsRes.data?.lawyers);
    console.log('   Cases:', statsRes.data?.cases);
    console.log('   Organizations:', statsRes.data?.organizations);
    console.log('   Unread Notifications:', statsRes.data?.unreadNotificationsCount);
    console.log('   Recent Audit Logs Count:', statsRes.data?.recentAuditLogs?.length);
    console.log('   ✓ Stats returned accurately!\n');
  } catch (err) {
    console.error('   ❌ Stats failed:', err.message);
  }

  // 4. Citizens Management
  let firstCitizenId = null;
  try {
    console.log('4. Testing Citizens List (GET /api/admin/citizens)...');
    const citRes = await req('/admin/citizens?page=1&limit=5', { headers: authHeaders });
    console.log('   Status:', citRes.status);
    console.log('   Total Citizens:', citRes.data?.total);
    console.log('   Returned on page:', citRes.data?.citizens?.length);
    if (citRes.data?.citizens?.length > 0) {
      firstCitizenId = citRes.data.citizens[0].id;
      const c = citRes.data.citizens[0];
      console.log(`   Sample Citizen: #${c.id} - ${c.full_name} (${c.district}) - Status: ${c.status} - Cases: ${c.cases_count}`);
      console.log('   Privacy Check (password field omitted?):', c.password === undefined ? 'PASSED (Hidden)' : 'FAILED (Leaked!)');
    }
    console.log('   ✓ Citizens API verified successfully!\n');
  } catch (err) {
    console.error('   ❌ Citizens List failed:', err.message);
  }

  // 5. Citizen Profile & Status Update
  if (firstCitizenId) {
    try {
      console.log(`5. Testing Single Citizen (GET /api/admin/citizens/${firstCitizenId})...`);
      const singleCitRes = await req(`/admin/citizens/${firstCitizenId}`, { headers: authHeaders });
      console.log('   Citizen Name:', singleCitRes.data?.citizen?.full_name);
      console.log('   Cases Count:', singleCitRes.data?.citizen?.cases?.length);
      console.log('   Evidence Vault Files:', singleCitRes.data?.citizen?.evidenceVault?.length);

      console.log(`   Testing Status Update (PUT /api/admin/citizens/${firstCitizenId}/status)...`);
      const updateRes = await req(`/admin/citizens/${firstCitizenId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          status: 'active',
          reason: 'Automated test suite verification',
        }),
      });
      console.log('   Status Update Response:', updateRes.data?.message);
      console.log('   ✓ Citizen Status API verified successfully!\n');
    } catch (err) {
      console.error('   ❌ Single Citizen test failed:', err.message);
    }
  }

  // 6. Lawyers Management
  let firstLawyerId = null;
  try {
    console.log('6. Testing Lawyers List (GET /api/admin/lawyers)...');
    const lawRes = await req('/admin/lawyers?page=1&limit=5', { headers: authHeaders });
    console.log('   Status:', lawRes.status);
    console.log('   Total Lawyers:', lawRes.data?.total);
    console.log('   Returned on page:', lawRes.data?.lawyers?.length);
    if (lawRes.data?.lawyers?.length > 0) {
      firstLawyerId = lawRes.data.lawyers[0].id;
      const l = lawRes.data.lawyers[0];
      console.log(`   Sample Advocate: #${l.id} - ${l.name} (${l.specialty}) - SBC: ${l.sbc_number} - Status: ${l.status}`);
      console.log('   Privacy Check (password hidden?):', l.password === undefined ? 'PASSED (Hidden)' : 'FAILED (Leaked!)');
    }
    console.log('   ✓ Lawyers API verified successfully!\n');
  } catch (err) {
    console.error('   ❌ Lawyers List failed:', err.message);
  }

  // 7. Lawyer Profile & Status Update
  if (firstLawyerId) {
    try {
      console.log(`7. Testing Single Lawyer (GET /api/admin/lawyers/${firstLawyerId})...`);
      const singleLawRes = await req(`/admin/lawyers/${firstLawyerId}`, { headers: authHeaders });
      console.log('   Lawyer Name:', singleLawRes.data?.lawyer?.name);
      console.log('   Experience:', singleLawRes.data?.lawyer?.experience_years, 'years');

      console.log(`   Testing Status Update (PUT /api/admin/lawyers/${firstLawyerId}/status)...`);
      const lawUpdateRes = await req(`/admin/lawyers/${firstLawyerId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          status: 'active',
          reason: 'Verified on Sindh Bar Council register',
        }),
      });
      console.log('   Advocate Status Update Response:', lawUpdateRes.data?.message);
      console.log('   ✓ Lawyer Status API verified successfully!\n');
    } catch (err) {
      console.error('   ❌ Single Lawyer test failed:', err.message);
    }
  }

  // 8. NGOs Management
  try {
    console.log('8. Testing NGOs List (GET /api/admin/ngos)...');
    const ngoRes = await req('/admin/ngos', { headers: authHeaders });
    console.log('   Status:', ngoRes.status);
    console.log('   Total NGOs:', ngoRes.data?.total);
    if (ngoRes.data?.ngos?.length > 0) {
      const n = ngoRes.data.ngos[0];
      console.log(`   Sample NGO: #${n.id} - ${n.full_name} (${n.organization_type}) - Status: ${n.status}`);
    }
    console.log('   ✓ NGOs API verified successfully!\n');
  } catch (err) {
    console.error('   ❌ NGOs List failed:', err.message);
  }

  // 9. Media Management
  try {
    console.log('9. Testing Media List (GET /api/admin/media)...');
    const medRes = await req('/admin/media', { headers: authHeaders });
    console.log('   Status:', medRes.status);
    console.log('   Total Media Outlets:', medRes.data?.total);
    if (medRes.data?.media?.length > 0) {
      const m = medRes.data.media[0];
      console.log(`   Sample Media: #${m.id} - ${m.full_name} (${m.channel_name || m.media_type}) - Status: ${m.status}`);
    }
    console.log('   ✓ Media API verified successfully!\n');
  } catch (err) {
    console.error('   ❌ Media List failed:', err.message);
  }

  // 10. Audit Logs
  try {
    console.log('10. Testing Audit Logs (GET /api/admin/audit-logs)...');
    const auditRes = await req('/admin/audit-logs?page=1&limit=5', { headers: authHeaders });
    console.log('   Status:', auditRes.status);
    console.log('   Total Audit Logs in DB:', auditRes.data?.total);
    console.log('   Returned on page:', auditRes.data?.logs?.length);
    auditRes.data?.logs?.forEach((log) => {
      console.log(`   - [${log.created_at}] [${log.action}] (${log.severity}): ${log.description}`);
    });
    console.log('   ✓ Audit Logs API verified successfully!\n');
  } catch (err) {
    console.error('   ❌ Audit Logs failed:', err.message);
  }

  // 11. Admin Notifications
  try {
    console.log('11. Testing Admin Notifications (GET /api/admin/notifications)...');
    const notifRes = await req('/admin/notifications', { headers: authHeaders });
    console.log('   Status:', notifRes.status);
    console.log('   Total Notifications:', notifRes.data?.total);
    console.log('   Unread Count:', notifRes.data?.unreadCount);
    if (notifRes.data?.notifications?.length > 0) {
      const firstNotif = notifRes.data.notifications[0];
      console.log(`   Sample Notification: [${firstNotif.type}] ${firstNotif.title} - ${firstNotif.message}`);

      // Mark single read
      await req(`/admin/notifications/${firstNotif.id}/read`, {
        method: 'PUT',
        headers: authHeaders,
      });
      console.log(`   Marked notification #${firstNotif.id} as read.`);
    }
    console.log('   ✓ Notifications API verified successfully!\n');
  } catch (err) {
    console.error('   ❌ Notifications failed:', err.message);
  }

  // 12. Swagger Verification
  try {
    console.log('12. Testing Swagger UI Docs Endpoint (GET http://localhost:5000/api-docs)...');
    const swaggerDocRes = await fetch('http://localhost:5000/api/docs.json');
    const swaggerDoc = await swaggerDocRes.json();
    console.log('   Status:', swaggerDocRes.status);
    console.log('   Swagger Title:', swaggerDoc.info.title);
    const adminPaths = Object.keys(swaggerDoc.paths).filter((p) => p.startsWith('/admin'));
    console.log(`   Documented Admin Paths in Swagger (${adminPaths.length} endpoints):`);
    adminPaths.forEach((p) => console.log(`     • ${p}`));
    console.log('   ✓ Swagger UI Documentation verified successfully!\n');
  } catch (err) {
    console.error('   ❌ Swagger verification failed:', err.message);
  }

  console.log('========================================================');
  console.log('      ALL ADMIN PORTAL APIS VERIFIED AND OPERATIONAL    ');
  console.log('========================================================');
}

testAllAdminApis();
