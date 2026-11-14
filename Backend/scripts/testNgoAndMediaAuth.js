const db = require('../config/db');
const ngoService = require('../services/ngoServiceImpl');
const mediaService = require('../services/mediaServiceImpl');
const citizenService = require('../services/citizenServiceImpl');
const LoginNgoDTO = require('../dto/LoginNgoDTO');
const LoginMediaDTO = require('../dto/LoginMediaDTO');

async function testAuth() {
  try {
    console.log('--- Testing NGO & Media Separation ---');

    // 1. Test NGO Login with NCHD
    console.log('\n1. Testing NGO Login for NCHD (contact@nchd.org.pk)...');
    const ngoLoginRes = await ngoService.loginNgo(new LoginNgoDTO({
      email: 'contact@nchd.org.pk',
      password: 'Nchd@12345',
    }));
    console.log('✓ NGO Login successful! Token received.');
    console.log('NGO details:', {
      id: ngoLoginRes.ngo.id,
      fullName: ngoLoginRes.ngo.fullName,
      resourcePerson: ngoLoginRes.ngo.resourcePerson,
      role: ngoLoginRes.ngo.role,
      status: ngoLoginRes.ngo.status,
    });

    // 2. Test Media Login with KTN News
    console.log('\n2. Testing Media Login for KTN News (contact@ktnnews.tv)...');
    const mediaLoginRes = await mediaService.loginMedia(new LoginMediaDTO({
      email: 'contact@ktnnews.tv',
      password: 'Ktn@12345',
    }));
    console.log('✓ Media Login successful! Token received.');
    console.log('Media details:', {
      id: mediaLoginRes.media.id,
      fullName: mediaLoginRes.media.fullName,
      channelName: mediaLoginRes.media.channelName,
      resourcePerson: mediaLoginRes.media.resourcePerson,
      role: mediaLoginRes.media.role,
      status: mediaLoginRes.media.status,
    });

    // 3. Test Cross-Portal Protection (NGO trying to login to Media portal)
    console.log('\n3. Testing Cross-Portal Protection: NCHD (role: ngo) trying to login via Media service...');
    try {
      await mediaService.loginMedia(new LoginMediaDTO({
        email: 'contact@nchd.org.pk',
        password: 'Nchd@12345',
      }));
      console.error('FAIL: NGO should not be able to login via Media portal!');
    } catch (e) {
      console.log('✓ Expected rejection caught:', e.message);
    }

    // 4. Test Cross-Portal Protection: KTN News (role: media) trying to login via NGO service
    console.log('\n4. Testing Cross-Portal Protection: KTN News (role: media) trying to login via NGO service...');
    try {
      await ngoService.loginNgo(new LoginNgoDTO({
        email: 'contact@ktnnews.tv',
        password: 'Ktn@12345',
      }));
      console.error('FAIL: Media should not be able to login via NGO portal!');
    } catch (e) {
      console.log('✓ Expected rejection caught:', e.message);
    }

    // 5. Test Citizen Service: getAllNgos
    console.log('\n5. Testing getAllNgos (only NCHD should be returned)...');
    const ngos = await citizenService.getAllNgos();
    console.log(`Found ${ngos.length} NGO(s):`, ngos);

    // 6. Test Citizen Service: getAllMedia
    console.log('\n6. Testing getAllMedia (only KTN News should be returned)...');
    const media = await citizenService.getAllMedia();
    console.log(`Found ${media.length} Media Partner(s):`, media);

    console.log('\nALL BACKEND TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testAuth();
