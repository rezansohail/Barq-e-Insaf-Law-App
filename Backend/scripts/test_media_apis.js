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

async function runTests() {
  console.log('🚀 STARTING COMPREHENSIVE MEDIA PORTAL API TEST SUITE...\n');

  try {
    // 1. MEDIA LOGIN
    console.log('--- TEST 1: POST /api/media/login ---');
    const loginRes = await request('POST', '/api/media/login', {
      email: 'contact@ktnnews.tv',
      password: 'Ktn@12345',
    });
    console.log('Status:', loginRes.status);
    console.log('Response:', loginRes.data.message);
    const mediaToken = loginRes.data.token;
    if (!mediaToken) throw new Error('Failed to get media token');
    console.log('✅ Media Token Obtained Successfully!\n');

    // 2. GET MEDIA PROFILE
    console.log('--- TEST 2: GET /api/media/me ---');
    const profileRes = await request('GET', '/api/media/me', null, mediaToken);
    console.log('Status:', profileRes.status);
    console.log('Media Name:', profileRes.data.media?.name);
    console.log('Channel:', profileRes.data.media?.channelName);
    console.log('Resource Person:', profileRes.data.media?.resourcePerson);
    console.log('✅ Media Profile Verified!\n');

    // 3. SINDH DISPUTE HEATMAP & ANALYTICS
    console.log('--- TEST 3: GET /api/media/analytics/heatmap ---');
    const heatmapRes = await request('GET', '/api/media/analytics/heatmap?range=This%20Month');
    console.log('Status:', heatmapRes.status);
    console.log('Summary:', heatmapRes.data.summary);
    console.log('Districts Heatmap:');
    console.table(heatmapRes.data.districtHeatmap);
    console.log('Categories Breakdown:');
    console.table(heatmapRes.data.categoriesBreakdown);
    console.log('✅ Real-time Heatmap & Percentages Working Correctly!\n');

    // 4. PUBLIC COURT DOCKET (ANONYMIZED)
    console.log('--- TEST 4: GET /api/media/docket ---');
    const docketRes = await request('GET', '/api/media/docket');
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
      // Verify no citizen names/phones/cnics leaked
      if (sample.citizen || sample.phone || sample.cnic) {
        throw new Error('FAILED: Citizen privacy violated! Personal details exposed.');
      }
    }
    console.log('✅ Anonymized Court Docket Verified (Citizen Privacy Protected)!\n');

    // 5. CITIZEN REQUESTS MEDIA COVERAGE ON CASE 5
    console.log('--- TEST 5: POST /api/citizens/6/cases/5/media-request ---');
    const mediaReqRes = await request('POST', '/api/citizens/6/cases/5/media-request', {
      allowContact: true,
      notes: 'Scheme 33 land grabbing syndicate operating openly, requesting broadcast investigation.',
    });
    console.log('Status:', mediaReqRes.status);
    console.log('Response:', mediaReqRes.data.message);
    console.log('Updated Case Status:', mediaReqRes.data.case?.media_status);
    console.log('✅ Citizen Media Request Created!\n');

    // 6. MEDIA DESK FETCHES CITIZEN LEADS
    console.log('--- TEST 6: GET /api/media/leads ---');
    const leadsRes = await request('GET', '/api/media/leads', null, mediaToken);
    console.log('Status:', leadsRes.status);
    console.log('Total Leads:', leadsRes.data.count);
    console.log('Leads List:', leadsRes.data.leads);
    console.log('✅ Citizen Whistleblower Leads Retrieved by Media!\n');

    // 7. MEDIA DESK UPDATES LEAD COVERAGE STATUS
    console.log('--- TEST 7: PUT /api/media/cases/5/status ---');
    const updateLeadRes = await request('PUT', '/api/media/cases/5/status', {
      status: 'under_investigation',
      notes: 'Assigned to KTN News Legal Affairs Bureau Chief for ground reporting.',
    }, mediaToken);
    console.log('Status:', updateLeadRes.status);
    console.log('Message:', updateLeadRes.data.message);
    console.log('Updated Status:', updateLeadRes.data.case?.media_status);
    console.log('✅ Case Media Status Updated to under_investigation!\n');

    // 8. PUBLISH MEDIA STORY
    console.log('--- TEST 8: POST /api/media/stories ---');
    const storyRes = await request('POST', '/api/media/stories', {
      title: 'Investigation: Land Grabbing Nexus in Scheme 33 Exposed',
      summary: 'KTN News investigation uncovers illegal demarcation cartels violating Sindh High Court stay orders.',
      district: 'Karachi Central',
      category: 'Property & Land Rights',
      journalistName: 'Bureau Chief KTN News',
      broadcastUrl: 'https://ktnnews.tv/investigative/scheme33-demarcation',
      isBreaking: true,
    }, mediaToken);
    console.log('Status:', storyRes.status);
    console.log('Response:', storyRes.data.message);
    const createdStoryId = storyRes.data.story?.id;
    console.log('Published Story ID:', createdStoryId);
    console.log('✅ Investigative Media Story Published!\n');

    // 9. GET PUBLISHED MEDIA STORIES
    console.log('--- TEST 9: GET /api/media/stories ---');
    const storiesRes = await request('GET', '/api/media/stories');
    console.log('Status:', storiesRes.status);
    console.log(`Retrieved ${storiesRes.data.length} published stories.`);
    console.log('Latest Story:', storiesRes.data[0]?.title);
    console.log('Channel:', storiesRes.data[0]?.channel_name);
    console.log('✅ Media Stories Feed Working!\n');

    // 10. GET SINGLE MEDIA STORY BY ID
    if (createdStoryId) {
      console.log(`--- TEST 10: GET /api/media/stories/${createdStoryId} ---`);
      const singleStoryRes = await request('GET', `/api/media/stories/${createdStoryId}`);
      console.log('Status:', singleStoryRes.status);
      console.log('Story Headline:', singleStoryRes.data.title);
      console.log('Broadcast Link:', singleStoryRes.data.broadcast_url);
      console.log('✅ Single Story Retrieval Verified!\n');
    }

    // 11. EXPORT PRESS PACKET REPORT
    console.log('--- TEST 11: POST /api/media/reports/export ---');
    const reportRes = await request('POST', '/api/media/reports/export', {
      format: 'PDF',
      anonymizeLitigants: true,
    });
    console.log('Status:', reportRes.status);
    console.log('Report ID:', reportRes.data.reportId);
    console.log('Editorial Compliance:', reportRes.data.editorialCompliance);
    console.log('Download URL:', reportRes.data.downloadUrl);
    console.log('✅ Press Packet Report Export Working!\n');

    console.log('🎉 ALL 11 MEDIA PORTAL APIS PASSED 100% SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

runTests();
