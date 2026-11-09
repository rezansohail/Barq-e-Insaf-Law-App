const RegisterNgoDTO = require('../dto/RegisterNgoDTO');
const LoginNgoDTO = require('../dto/LoginNgoDTO');
const ngoService = require('../services/ngoServiceImpl');
const db = require('../config/db');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE NGO / MEDIA AUTH TEST SUITE');
  console.log('====================================================\n');

  const testEmail = `test_ngo_${Date.now()}@edhi.org.pk`;
  const testPhone = `0300${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testCnic = `42101-${Math.floor(1000000 + Math.random() * 9000000)}-1`;

  let passed = 0;
  let failed = 0;

  // Test 1: Reject registration with missing required fields
  try {
    console.log('Test 1: Register NGO with missing name and district...');
    const dto = new RegisterNgoDTO({
      fullName: '',
      email: testEmail,
      phone: testPhone,
      district: '',
      password: 'SecurePassword123!',
    });
    await ngoService.registerNgo(dto);
    console.error('❌ Test 1 FAILED: Allowed empty name/district');
    failed++;
  } catch (err) {
    if (err.statusCode === 400) {
      console.log('✅ Test 1 PASSED: Correctly rejected missing required fields (400 Bad Request)');
      passed++;
    } else {
      console.error('❌ Test 1 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 2: Reject registration with weak password
  try {
    console.log('\nTest 2: Register NGO with weak password...');
    const dto = new RegisterNgoDTO({
      fullName: 'Legal Rights Foundation',
      email: testEmail,
      phone: testPhone,
      district: 'Karachi South',
      password: 'weak',
    });
    await ngoService.registerNgo(dto);
    console.error('❌ Test 2 FAILED: Allowed weak password');
    failed++;
  } catch (err) {
    if (err.statusCode === 400) {
      console.log('✅ Test 2 PASSED: Correctly rejected weak password (min 8 chars, lowercase, number, special char)');
      passed++;
    } else {
      console.error('❌ Test 2 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 3: Successfully register NGO / Media
  let ngoId = null;
  let ngoToken = null;
  try {
    console.log('\nTest 3: Register valid NGO / Media organization...');
    const dto = new RegisterNgoDTO({
      fullName: 'Human Rights Commission Sindh',
      email: testEmail,
      phone: testPhone,
      cnic: testCnic,
      district: 'Karachi South',
      password: 'NgoSecurePass2026@!',
      confirmPassword: 'NgoSecurePass2026@!',
      organizationType: 'Human Rights / Legal Aid',
      registrationNumber: 'NGO-SINDH-2026-08',
    });
    const result = await ngoService.registerNgo(dto);
    ngoId = result.ngo.id;
    ngoToken = result.token;

    if (result.token && result.ngo && result.ngo.role === 'ngo' && !result.ngo.password) {
      console.log('✅ Test 3 PASSED: NGO / Media registered successfully. Token issued, password omitted.');
      console.log('   Created NGO:', result.ngo);
      passed++;
    } else {
      console.error('❌ Test 3 FAILED: Invalid response payload');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 3 FAILED:', err.message);
    failed++;
  }

  // Test 4: Prevent duplicate email registration
  try {
    console.log('\nTest 4: Attempt duplicate email registration...');
    const dto = new RegisterNgoDTO({
      fullName: 'Another Duplicate NGO',
      email: testEmail, // duplicate
      phone: '03009998811',
      district: 'Hyderabad',
      password: 'NgoSecurePass2026@!',
    });
    await ngoService.registerNgo(dto);
    console.error('❌ Test 4 FAILED: Allowed duplicate email');
    failed++;
  } catch (err) {
    if (err.statusCode === 409) {
      console.log('✅ Test 4 PASSED: Correctly blocked duplicate email with 409 Conflict');
      passed++;
    } else {
      console.error('❌ Test 4 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 5: Prevent duplicate phone registration
  try {
    console.log('\nTest 5: Attempt duplicate phone registration...');
    const dto = new RegisterNgoDTO({
      fullName: 'Another Unique NGO',
      email: `another_${Date.now()}@ngo.org`,
      phone: testPhone, // duplicate
      district: 'Larkana',
      password: 'NgoSecurePass2026@!',
    });
    await ngoService.registerNgo(dto);
    console.error('❌ Test 5 FAILED: Allowed duplicate phone');
    failed++;
  } catch (err) {
    if (err.statusCode === 409) {
      console.log('✅ Test 5 PASSED: Correctly blocked duplicate phone with 409 Conflict');
      passed++;
    } else {
      console.error('❌ Test 5 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 6: Login with incorrect password
  try {
    console.log('\nTest 6: NGO Login with WRONG password...');
    const dto = new LoginNgoDTO({
      email: testEmail,
      password: 'WrongPassword999!',
    });
    await ngoService.loginNgo(dto);
    console.error('❌ Test 6 FAILED: Allowed login with wrong password');
    failed++;
  } catch (err) {
    if (err.statusCode === 401) {
      console.log('✅ Test 6 PASSED: Correctly blocked wrong password with 401 Unauthorized');
      passed++;
    } else {
      console.error('❌ Test 6 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 7: Login with correct credentials
  try {
    console.log('\nTest 7: NGO Login with CORRECT credentials...');
    const dto = new LoginNgoDTO({
      email: testEmail,
      password: 'NgoSecurePass2026@!',
    });
    const result = await ngoService.loginNgo(dto);

    if (result.token && result.ngo && result.ngo.email === testEmail && result.ngo.role === 'ngo') {
      console.log('✅ Test 7 PASSED: NGO Login successful. Valid JWT token returned.');
      passed++;
    } else {
      console.error('❌ Test 7 FAILED: Incomplete login response');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 7 FAILED:', err.message);
    failed++;
  }

  // Test 8: Retrieve NGO profile by ID
  try {
    console.log('\nTest 8: Retrieve NGO profile by ID...');
    const profile = await ngoService.getNgoById(ngoId);
    if (profile && profile.id === ngoId && !profile.password) {
      console.log('✅ Test 8 PASSED: Profile retrieved accurately without password leakage.');
      passed++;
    } else {
      console.error('❌ Test 8 FAILED: Profile mismatch');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 FAILED:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
