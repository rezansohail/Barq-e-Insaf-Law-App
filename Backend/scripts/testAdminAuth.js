const RegisterAdminDTO = require('../dto/RegisterAdminDTO');
const LoginAdminDTO = require('../dto/LoginAdminDTO');
const adminAuthService = require('../services/adminAuthServiceImpl');
const db = require('../config/db');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE ADMIN AUTH TEST SUITE');
  console.log('====================================================\n');

  const testEmail1 = `test_admin_1_${Date.now()}@barqeinsaf.gov.pk`;
  const testPhone1 = `0300${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testEmail2 = `test_admin_2_${Date.now()}@barqeinsaf.gov.pk`;
  const testPhone2 = `0300${Math.floor(1000000 + Math.random() * 9000000)}`;
  const secretKey = process.env.ADMIN_SECRET_KEY || 'barqeinsaf-admin-secret-2026';

  let passed = 0;
  let failed = 0;

  // Test 1: Reject registration when adminSecretKey is missing
  try {
    console.log('Test 1: Register admin WITHOUT secret key...');
    const dto = new RegisterAdminDTO({
      fullName: 'Intruder Admin',
      email: 'intruder@example.com',
      phone: '03001112233',
      district: 'Karachi South',
      password: 'SecurePassword123!',
      adminSecretKey: '',
    });
    await adminAuthService.registerAdmin(dto);
    console.error('❌ Test 1 FAILED: Allowed registration without secret key');
    failed++;
  } catch (err) {
    if (err.statusCode === 403 || err.message.includes('Admin Secret Key')) {
      console.log('✅ Test 1 PASSED: Correctly blocked unauthorized registration without secret key');
      passed++;
    } else {
      console.error('❌ Test 1 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 2: Reject registration when adminSecretKey is WRONG
  try {
    console.log('\nTest 2: Register admin WITH WRONG secret key...');
    const dto = new RegisterAdminDTO({
      fullName: 'Hacker Admin',
      email: 'hacker@example.com',
      phone: '03001112234',
      district: 'Karachi South',
      password: 'SecurePassword123!',
      adminSecretKey: 'wrong-key-999',
    });
    await adminAuthService.registerAdmin(dto);
    console.error('❌ Test 2 FAILED: Allowed registration with wrong secret key');
    failed++;
  } catch (err) {
    if (err.statusCode === 403 || err.message.includes('Invalid Admin Secret Key')) {
      console.log('✅ Test 2 PASSED: Correctly blocked registration with wrong secret key');
      passed++;
    } else {
      console.error('❌ Test 2 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 3: Reject registration with weak password
  try {
    console.log('\nTest 3: Register admin with weak password...');
    const dto = new RegisterAdminDTO({
      fullName: 'Weak Password Admin',
      email: 'weak@example.com',
      phone: '03001112235',
      district: 'Karachi South',
      password: 'simple',
      adminSecretKey: secretKey,
    });
    await adminAuthService.registerAdmin(dto);
    console.error('❌ Test 3 FAILED: Allowed weak password');
    failed++;
  } catch (err) {
    if (err.statusCode === 400) {
      console.log('✅ Test 3 PASSED: Correctly rejected weak password (min 8 chars, 1 num, 1 special char)');
      passed++;
    } else {
      console.error('❌ Test 3 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 4: Register Admin 1 successfully with valid secret key
  let admin1Token = null;
  let admin1Id = null;
  try {
    console.log('\nTest 4: Register Admin 1 with valid secret key...');
    const dto = new RegisterAdminDTO({
      fullName: 'Saif Anjum (Super Admin)',
      email: testEmail1,
      phone: testPhone1,
      district: 'Karachi Central',
      cnic: `42101-${Math.floor(1000000 + Math.random() * 9000000)}-1`,
      password: 'SuperAdminPass2026@!',
      confirmPassword: 'SuperAdminPass2026@!',
      adminSecretKey: secretKey,
      isSuperAdmin: true,
    });
    const result = await adminAuthService.registerAdmin(dto);
    admin1Token = result.token;
    admin1Id = result.admin.id;

    if (result.token && result.admin && result.admin.role === 'admin' && !result.admin.password) {
      console.log('✅ Test 4 PASSED: Successfully registered Admin 1. Token generated, password omitted from response.');
      console.log('   Admin data:', result.admin);
      passed++;
    } else {
      console.error('❌ Test 4 FAILED: Incomplete response data');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 4 FAILED:', err.message);
    failed++;
  }

  // Test 5: Prevent duplicate email registration
  try {
    console.log('\nTest 5: Attempt duplicate email registration...');
    const dto = new RegisterAdminDTO({
      fullName: 'Duplicate Admin',
      email: testEmail1, // same email as Admin 1
      phone: '03009998877',
      district: 'Lahore',
      password: 'SuperAdminPass2026@!',
      adminSecretKey: secretKey,
    });
    await adminAuthService.registerAdmin(dto);
    console.error('❌ Test 5 FAILED: Allowed duplicate email');
    failed++;
  } catch (err) {
    if (err.statusCode === 409) {
      console.log('✅ Test 5 PASSED: Correctly rejected duplicate email with 409 Conflict');
      passed++;
    } else {
      console.error('❌ Test 5 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 6: Register Admin 2 successfully
  try {
    console.log('\nTest 6: Register Admin 2 with valid secret key...');
    const dto = new RegisterAdminDTO({
      fullName: 'Co-Admin Legal Team',
      email: testEmail2,
      phone: testPhone2,
      district: 'Islamabad',
      password: 'CoAdminSecurePass2026#',
      confirmPassword: 'CoAdminSecurePass2026#',
      adminSecretKey: secretKey,
      isSuperAdmin: false,
    });
    const result = await adminAuthService.registerAdmin(dto);

    if (result.token && result.admin && result.admin.role === 'admin') {
      console.log('✅ Test 6 PASSED: Successfully registered Admin 2.');
      console.log('   Admin data:', result.admin);
      passed++;
    } else {
      console.error('❌ Test 6 FAILED: Incomplete response for Admin 2');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 6 FAILED:', err.message);
    failed++;
  }

  // Test 7: Admin Login with incorrect password
  try {
    console.log('\nTest 7: Admin Login with WRONG password...');
    const dto = new LoginAdminDTO({
      email: testEmail1,
      password: 'WrongPassword999!',
    });
    await adminAuthService.loginAdmin(dto);
    console.error('❌ Test 7 FAILED: Allowed login with wrong password');
    failed++;
  } catch (err) {
    if (err.statusCode === 401) {
      console.log('✅ Test 7 PASSED: Correctly blocked wrong password with 401 Unauthorized');
      passed++;
    } else {
      console.error('❌ Test 7 FAILED with unexpected error:', err.message);
      failed++;
    }
  }

  // Test 8: Admin Login with correct credentials
  try {
    console.log('\nTest 8: Admin Login with CORRECT credentials...');
    const dto = new LoginAdminDTO({
      email: testEmail1,
      password: 'SuperAdminPass2026@!',
    });
    const result = await adminAuthService.loginAdmin(dto);

    if (result.token && result.admin && result.admin.email === testEmail1 && result.admin.role === 'admin') {
      console.log('✅ Test 8 PASSED: Admin Login successful. Valid JWT token returned.');
      passed++;
    } else {
      console.error('❌ Test 8 FAILED: Login response missing token or admin role');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 8 FAILED:', err.message);
    failed++;
  }

  // Test 9: Get Admin Profile by ID
  try {
    console.log('\nTest 9: Get Admin profile by ID...');
    const profile = await adminAuthService.getAdminById(admin1Id);
    if (profile && profile.id === admin1Id && !profile.password) {
      console.log('✅ Test 9 PASSED: Admin profile retrieved, password omitted.');
      passed++;
    } else {
      console.error('❌ Test 9 FAILED: Profile mismatch');
      failed++;
    }
  } catch (err) {
    console.error('❌ Test 9 FAILED:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
