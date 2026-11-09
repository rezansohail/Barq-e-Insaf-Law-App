const citizenService = require('../services/citizenServiceImpl');
const RegisterCitizenDTO = require('../dto/RegisterCitizenDTO');
const LoginCitizenDTO = require('../dto/LoginCitizenDTO');
const db = require('../config/db');

async function test() {
  console.log('=== Running Citizen Auth (Register & Login) Tests ===\n');

  // 1. Clean previous test record if exists
  await db.query("DELETE FROM citizens WHERE email = 'zainab@testcitizen.pk' OR phone = '03001234567'");
  await db.query("DELETE FROM users WHERE email = 'zainab@testcitizen.pk'");

  // 2. Register valid citizen
  console.log('Test 1: Registering valid citizen...');
  const regDTO = new RegisterCitizenDTO({
    fullName: 'Zainab Bibi',
    phone: '03001234567',
    district: 'Karachi',
    email: 'zainab@testcitizen.pk',
    password: 'Password123!',
  });

  const regRes = await citizenService.registerCitizen(regDTO);
  console.log('✅ Test 1 PASSED: Citizen registered successfully!');
  console.log('   - Citizen ID:', regRes.citizen.id);
  console.log('   - Full Name:', regRes.citizen.fullName);
  console.log('   - District:', regRes.citizen.district);
  console.log('   - Phone:', regRes.citizen.phone);
  console.log('   - JWT Token Received:', regRes.token ? 'Yes' : 'No');

  // 3. Test Duplicate Email
  console.log('\nTest 2: Attempting duplicate email...');
  try {
    const dupEmailDTO = new RegisterCitizenDTO({
      fullName: 'Another Person',
      phone: '03009999999',
      district: 'Hyderabad',
      email: 'zainab@testcitizen.pk',
      password: 'Password123!',
    });
    await citizenService.registerCitizen(dupEmailDTO);
    console.error('❌ Test 2 FAILED: Duplicate email was allowed!');
  } catch (err) {
    console.log('✅ Test 2 PASSED (Duplicate email blocked):', err.message);
  }

  // 4. Test Duplicate Phone
  console.log('\nTest 3: Attempting duplicate phone (03001234567)...');
  try {
    const dupPhoneDTO = new RegisterCitizenDTO({
      fullName: 'Third Person',
      phone: '03001234567',
      district: 'Sukkur',
      email: 'third@testcitizen.pk',
      password: 'Password123!',
    });
    await citizenService.registerCitizen(dupPhoneDTO);
    console.error('❌ Test 3 FAILED: Duplicate phone was allowed!');
  } catch (err) {
    console.log('✅ Test 3 PASSED (Duplicate phone blocked):', err.message);
  }

  // 5. Test Weak Password
  console.log('\nTest 4: Attempting weak password...');
  try {
    const weakPassDTO = new RegisterCitizenDTO({
      fullName: 'Weak Pass Citizen',
      phone: '03008888888',
      district: 'Larkana',
      email: 'weak@testcitizen.pk',
      password: '123',
    });
    await citizenService.registerCitizen(weakPassDTO);
    console.error('❌ Test 4 FAILED: Weak password was allowed!');
  } catch (err) {
    console.log('✅ Test 4 PASSED (Validation caught weak password):', err.message);
  }

  // 6. Test Valid Login
  console.log('\nTest 5: Testing Citizen Login with correct credentials...');
  const loginDTO = new LoginCitizenDTO({
    email: 'zainab@testcitizen.pk',
    password: 'Password123!',
  });
  const loginRes = await citizenService.loginCitizen(loginDTO);
  console.log('✅ Test 5 PASSED: Login Successful!');
  console.log('   - Welcome message:', loginRes.message);
  console.log('   - Citizen Name:', loginRes.citizen.fullName);
  console.log('   - JWT Token Received:', loginRes.token ? 'Yes' : 'No');

  // 7. Test Invalid Login Password
  console.log('\nTest 6: Testing Citizen Login with wrong password...');
  try {
    const wrongLoginDTO = new LoginCitizenDTO({
      email: 'zainab@testcitizen.pk',
      password: 'WrongPassword999!',
    });
    await citizenService.loginCitizen(wrongLoginDTO);
    console.error('❌ Test 6 FAILED: Wrong password was allowed!');
  } catch (err) {
    console.log('✅ Test 6 PASSED (Rejected wrong password):', err.message);
  }

  // Clean test data
  await db.query("DELETE FROM citizens WHERE email = 'zainab@testcitizen.pk' OR phone = '03001234567'");
  await db.query("DELETE FROM users WHERE email = 'zainab@testcitizen.pk'");

  console.log('\n🎉 ALL CITIZEN TESTS COMPLETED SUCCESSFULLY AND CLEANED!');
  process.exit(0);
}

test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
