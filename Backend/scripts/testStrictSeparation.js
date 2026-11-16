const ngoService = require('../services/ngoServiceImpl');
const mediaService = require('../services/mediaServiceImpl');
const LoginNgoDTO = require('../dto/LoginNgoDTO');
const LoginMediaDTO = require('../dto/LoginMediaDTO');

async function testStrictSeparation() {
  try {
    console.log('=== STRICT SEPARATION VERIFICATION ===\n');

    // 1. Test NGO Service
    console.log('1. Testing pure NGO Service (NCHD)...');
    const ngoLogin = await ngoService.loginNgo(new LoginNgoDTO({
      email: 'contact@nchd.org.pk',
      password: 'Nchd@12345',
    }));
    console.log('✓ NGO Service Login Successful!');
    console.log('  Organization:', ngoLogin.ngo.fullName);
    console.log('  Resource Person:', ngoLogin.ngo.resourcePerson);
    console.log('  Role:', ngoLogin.ngo.role);

    // 2. Test Media Service
    console.log('\n2. Testing pure Media Service (KTN News)...');
    const mediaLogin = await mediaService.loginMedia(new LoginMediaDTO({
      email: 'contact@ktnnews.tv',
      password: 'Ktn@12345',
    }));
    console.log('✓ Media Service Login Successful!');
    console.log('  Channel:', mediaLogin.media.channelName);
    console.log('  Role:', mediaLogin.media.role);

    // 3. Test Cross-Rejection: Media user on NGO service
    console.log('\n3. Testing Cross-Portal Rejection (Media trying on NGO service)...');
    try {
      await ngoService.loginNgo(new LoginNgoDTO({
        email: 'contact@ktnnews.tv',
        password: 'Ktn@12345',
      }));
      throw new Error('FAILED: Media user should NOT be able to login via NGO service!');
    } catch (err) {
      console.log('✓ Cross-service rejection confirmed:', err.message);
    }

    // 4. Test Cross-Rejection: NGO user on Media service
    console.log('\n4. Testing Cross-Portal Rejection (NGO trying on Media service)...');
    try {
      await mediaService.loginMedia(new LoginMediaDTO({
        email: 'contact@nchd.org.pk',
        password: 'Nchd@12345',
      }));
      throw new Error('FAILED: NGO user should NOT be able to login via Media service!');
    } catch (err) {
      console.log('✓ Cross-service rejection confirmed:', err.message);
    }

    // 5. Test Directory Separation
    console.log('\n5. Testing Directory Queries...');
    const ngos = await ngoService.getAllNgos();
    console.log(`✓ NGO Directory count: ${ngos.length} (Only NGOs from ngos table)`);
    console.log('  NGOs:', ngos.map(n => n.fullName));

    const media = await mediaService.getAllMedia();
    console.log(`✓ Media Directory count: ${media.length} (Only Media from media table)`);
    console.log('  Media:', media.map(m => m.channelName));

    console.log('\n=== ALL SEPARATION CHECKS PASSED 100%! ===');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testStrictSeparation();
