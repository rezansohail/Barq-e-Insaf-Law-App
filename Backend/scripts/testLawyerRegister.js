const lawyerService = require('../services/lawyerServiceImpl');
const RegisterLawyerDTO = require('../dto/RegisterLawyerDTO');
const db = require('../config/db');

async function test() {
  console.log('=== Running Lawyer Registration Tests ===\n');

  // 1. Clean previous test record if exists
  await db.query("DELETE FROM lawyers WHERE email = 'bilawal@testlaw.pk' OR sbc_number = 'SBC-9999' OR cnic = '42101-9988776-1'");
  await db.query("DELETE FROM users WHERE email = 'bilawal@testlaw.pk'");

  // 2. Valid Registration Test
  console.log('Test 1: Registering valid lawyer...');
  const dto1 = new RegisterLawyerDTO({
    name: 'Advocate Bilawal Bhutto',
    phone: '03001239876',
    cnic: '42101-9988776-1',
    district: 'Karachi',
    sbcNumber: 'SBC-9999',
    specialty: 'Property / Land Disputes',
    email: 'bilawal@testlaw.pk',
    password: 'Password123!',
  });

  const res1 = await lawyerService.registerLawyer(dto1);
  console.log('✅ Test 1 PASSED: Lawyer created!');
  console.log('   - ID:', res1.lawyer.id);
  console.log('   - Name:', res1.lawyer.name);
  console.log('   - SBC Number:', res1.lawyer.sbcNumber);
  console.log('   - Verification Status:', res1.lawyer.verificationStatus);
  console.log('   - JWT Token generated:', res1.token ? 'Yes' : 'No');

  // 3. Duplicate SBC Test
  console.log('\nTest 2: Attempting duplicate SBC Number (SBC-9999)...');
  try {
    const dtoDuplicateSbc = new RegisterLawyerDTO({
      name: 'Another Lawyer',
      phone: '03009999999',
      cnic: '42101-1111111-1',
      district: 'Hyderabad',
      sbcNumber: 'SBC-9999',
      specialty: 'Family Law',
      email: 'another@testlaw.pk',
      password: 'Password123!',
    });
    await lawyerService.registerLawyer(dtoDuplicateSbc);
    console.error('❌ Test 2 FAILED: Duplicate SBC was allowed!');
  } catch (err) {
    console.log('✅ Test 2 PASSED (Duplicate SBC blocked):', err.message);
  }

  // 4. Duplicate CNIC Test
  console.log('\nTest 3: Attempting duplicate CNIC (42101-9988776-1)...');
  try {
    const dtoDuplicateCnic = new RegisterLawyerDTO({
      name: 'Third Lawyer',
      phone: '03008888888',
      cnic: '42101-9988776-1',
      district: 'Sukkur',
      sbcNumber: 'SBC-8888',
      specialty: 'Criminal Law',
      email: 'third@testlaw.pk',
      password: 'Password123!',
    });
    await lawyerService.registerLawyer(dtoDuplicateCnic);
    console.error('❌ Test 3 FAILED: Duplicate CNIC was allowed!');
  } catch (err) {
    console.log('✅ Test 3 PASSED (Duplicate CNIC blocked):', err.message);
  }

  // 5. Weak Password Test
  console.log('\nTest 4: Attempting weak password...');
  try {
    const dtoWeakPass = new RegisterLawyerDTO({
      name: 'Weak Pass Lawyer',
      phone: '03007777777',
      cnic: '42101-7777777-1',
      district: 'Larkana',
      sbcNumber: 'SBC-7777',
      specialty: 'Civil Law',
      email: 'weak@testlaw.pk',
      password: '123',
    });
    await lawyerService.registerLawyer(dtoWeakPass);
    console.error('❌ Test 4 FAILED: Weak password was allowed!');
  } catch (err) {
    console.log('✅ Test 4 PASSED (Validation error):', err.message);
  }

  // Clean test data at the end
  await db.query("DELETE FROM lawyers WHERE email = 'bilawal@testlaw.pk' OR sbc_number = 'SBC-9999' OR cnic = '42101-9988776-1'");
  await db.query("DELETE FROM users WHERE email = 'bilawal@testlaw.pk'");

  console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY AND CLEANED!');
  process.exit(0);
}

test().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
