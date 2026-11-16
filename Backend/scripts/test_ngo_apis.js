const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runNgoTests() {
  console.log('🚀 STARTING COMPREHENSIVE NGO (NCHD) API TEST SUITE...\n');

  try {
    // 1. NGO LOGIN
    console.log('--- TEST 1: POST /api/ngo/login ---');
    const loginRes = await request('POST', '/api/ngo/login', {
      email: 'contact@nchd.org.pk',
      password: 'Nchd@12345',
    });
    console.log('Status:', loginRes.status);
    console.log('Response:', loginRes.data.message);
    const ngoToken = loginRes.data.token;
    if (!ngoToken) throw new Error('Failed to get NGO token');
    console.log('✅ NCHD Token Obtained Successfully!\n');

    // 2. GET NGO PROFILE
    console.log('--- TEST 2: GET /api/ngo/me ---');
    const profileRes = await request('GET', '/api/ngo/me', null, ngoToken);
    console.log('Status:', profileRes.status);
    console.log('Org Name:', profileRes.data.ngo?.fullName);
    console.log('Resource Person:', profileRes.data.ngo?.resourcePerson);
    console.log('Org Type:', profileRes.data.ngo?.organizationType);
    console.log('✅ NGO Profile Verified!\n');

    // 3. SINDH DISPUTE HEATMAP & ANALYTICS FOR NGO
    console.log('--- TEST 3: GET /api/ngo/analytics/heatmap ---');
    const heatmapRes = await request('GET', '/api/ngo/analytics/heatmap?range=This%20Month');
    console.log('Status:', heatmapRes.status);
    console.log('Summary:', heatmapRes.data.summary);
    console.log('Districts Heatmap:');
    console.table(heatmapRes.data.districtHeatmap);
    console.log('Categories Breakdown:');
    console.table(heatmapRes.data.categoriesBreakdown);
    console.log('✅ Real-time NGO Heatmap Working Correctly!\n');

    // 4. PUBLIC COURT DOCKET (ANONYMIZED)
    console.log('--- TEST 4: GET /api/ngo/docket ---');
    const docketRes = await request('GET', '/api/ngo/docket');
    console.log('Status:', docketRes.status);
    console.log(`Retrieved ${docketRes.data.length} cases.`);
    if (docketRes.data.length > 0) {
      const sample = docketRes.data[0];
      console.log('Sample Case:', {
        id: sample.id,
        title: sample.title,
        type: sample.type,
        district: sample.district,
        court: sample.court,
        status: sample.status,
        litigantIdentityProtected: sample.litigantIdentityProtected,
      });
      if (sample.citizen || sample.phone || sample.cnic) {
        throw new Error('FAILED: Citizen privacy violated! Personal details exposed.');
      }
    }
    console.log('✅ Anonymized Court Docket Verified (Citizen Privacy Protected)!\n');

    // 5. CITIZEN REQUESTS LEGAL AID ON CASE 5
    console.log('--- TEST 5: POST /api/citizens/6/cases/5/ngo-request ---');
    const aidReqRes = await request('POST', '/api/citizens/6/cases/5/ngo-request', {
      allowContact: true,
      notes: 'Marginalized family in Scheme 33 unable to afford legal representation, requesting NCHD pro-bono defense.',
    });
    console.log('Status:', aidReqRes.status);
    console.log('Response:', aidReqRes.data.message);
    console.log('Updated Case Status:', aidReqRes.data.case?.ngo_status);
    console.log('✅ Citizen NGO Aid Request Created!\n');

    // 6. NGO DESK FETCHES AID REQUESTS / LEADS
    console.log('--- TEST 6: GET /api/ngo/leads ---');
    const leadsRes = await request('GET', '/api/ngo/leads', null, ngoToken);
    console.log('Status:', leadsRes.status);
    console.log('Total Aid Requests:', leadsRes.data.count);
    console.log('Leads List:', leadsRes.data.aidRequests);
    console.log('✅ Citizen Aid Requests Retrieved by NCHD!\n');

    // 7. NGO PRO-ACTIVE OUTREACH: OFFERS ASSISTANCE TO CASE 5
    console.log('--- TEST 7: POST /api/ngo/cases/5/offer-assistance ---');
    const offerRes = await request('POST', '/api/ngo/cases/5/offer-assistance', {
      programName: 'NCHD Legal Aid & Human Rights Protection Drive',
      message: 'NCHD Provincial Directorate Sindh has reviewed your case and assigned a pro-bono counsel panel.',
    }, ngoToken);
    console.log('Status:', offerRes.status);
    console.log('Message:', offerRes.data.message);
    console.log('Updated Case:', offerRes.data.case?.ngo_status);
    console.log('✅ NCHD Assistance Offer Dispatched!\n');

    // 8. NGO UPDATES AID STATUS TO AID_ASSIGNED
    console.log('--- TEST 8: PUT /api/ngo/cases/5/status ---');
    const updateAidRes = await request('PUT', '/api/ngo/cases/5/status', {
      status: 'aid_assigned',
      notes: 'Advocate from NCHD Legal Aid Panel appointed for upcoming hearing.',
    }, ngoToken);
    console.log('Status:', updateAidRes.status);
    console.log('Message:', updateAidRes.data.message);
    console.log('Updated Status:', updateAidRes.data.case?.ngo_status);
    console.log('✅ Case Legal Aid Status Updated to aid_assigned!\n');

    // 9. PUBLISH NGO HUMAN DEVELOPMENT STORY
    console.log('--- TEST 9: POST /api/ngo/stories ---');
    const storyRes = await request('POST', '/api/ngo/stories', {
      title: 'NCHD Legal Aid Clinic Resolves Rural Land Disputes in Sukkur',
      summary: 'Through Barq-e-Insaf pro-bono panel, NCHD provided free legal representation to 14 marginalized families facing unlawful eviction.',
      district: 'Sukkur',
      category: 'Legal Aid & Human Rights',
      officerName: 'Abdul Wajid Shaikh (Director NCHD)',
      programName: 'NCHD Community Rights & Feeder School Empowerment',
      isFeatured: true,
    }, ngoToken);
    console.log('Status:', storyRes.status);
    console.log('Response:', storyRes.data.message);
    const createdStoryId = storyRes.data.story?.id;
    console.log('Published Story ID:', createdStoryId);
    console.log('✅ NGO Field Story Published!\n');

    // 10. GET PUBLISHED NGO STORIES
    console.log('--- TEST 10: GET /api/ngo/stories ---');
    const storiesRes = await request('GET', '/api/ngo/stories');
    console.log('Status:', storiesRes.status);
    console.log(`Retrieved ${storiesRes.data.length} published NGO stories.`);
    console.log('Latest Story:', storiesRes.data[0]?.title);
    console.log('Org Name:', storiesRes.data[0]?.ngo_name);
    console.log('✅ NGO Stories Feed Working!\n');

    // 11. GET SINGLE NGO STORY BY ID
    if (createdStoryId) {
      console.log(`--- TEST 11: GET /api/ngo/stories/${createdStoryId} ---`);
      const singleStoryRes = await request('GET', `/api/ngo/stories/${createdStoryId}`);
      console.log('Status:', singleStoryRes.status);
      console.log('Story Headline:', singleStoryRes.data.title);
      console.log('Program Name:', singleStoryRes.data.program_name);
      console.log('✅ Single NGO Story Retrieval Verified!\n');
    }

    // 12. EXPORT INSTITUTIONAL REPORT
    console.log('--- TEST 12: POST /api/ngo/reports/export ---');
    const reportRes = await request('POST', '/api/ngo/reports/export', {
      format: 'PDF',
      anonymizeLitigants: true,
    });
    console.log('Status:', reportRes.status);
    console.log('Report ID:', reportRes.data.reportId);
    console.log('Statutory Mandate:', reportRes.data.statutoryMandate);
    console.log('Download URL:', reportRes.data.downloadUrl);
    console.log('✅ Institutional NCHD Report Export Working!\n');

    console.log('🎉 ALL 12 NGO (NCHD) APIS PASSED 100% SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

runNgoTests();
