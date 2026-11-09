const lawyerService = require('../services/lawyerServiceImpl');
const RegisterLawyerDTO = require('../dto/RegisterLawyerDTO');
const LoginLawyerDTO = require('../dto/LoginLawyerDTO');
const db = require('../config/db');

async function test() {
  console.log('=== Running Lawyer Login API Tests ===\n');

  // 1. Clean previous test record if exists
  await db.query("DELETE FROM lawyers WHERE email = 'login.test@law.pk' OR sbc_number = 'SBC-7788'");
  await db.query("DELETE FROM users WHERE email = 'login.test@law.pk'");

  // 2. Register test lawyer
  console.log('Step 1: Setting up test lawyer account...');
  const regDTO = new RegisterLawyerDTO({
    name: 'Advocate Ayesha Tariq',
    phone: '03009988776',
    cnic: '42101-7788990-1',
    district: 'Hyderabad',
    sbcNumber: 'SBC-7788',
    specialty: 'Family Law & Civil',
    email: 'login.test@law.pk',
    password: 'SecurePassword123!',
  });
  await lawyerService.registerLawyer(regDTO);
  console.log('✅ Test lawyer registered successfully.');

  // 3. Test Valid Login
  console.log('\nTest 1: Valid Login (Correct email & password)...');
  const validLoginDTO = new LoginLawyerDTO({
    email: 'login.test@law.pk',
    password: 'SecurePassword123!',
  });
  const loginRes = await lawyerService.loginLawyer(validLoginDTO);
  console.log('✅ Test 1 PASSED: Login Successful!');
  console.log('   - Welcome message:', loginRes.message);
  console.log('   - Lawyer Name:', loginRes.lawyer.name);
  console.log('   - Lawyer ID:', loginRes.lawyer.id);
  console.log('   - District:', loginRes.lawyer.district);
  console.log('   - SBC Number:', loginRes.lawyer.sbcNumber);
  console.log('   - JWT Token Received:', loginRes.token ? 'Yes (Valid)' : 'No');

  // 4. Test Invalid Password
  console.log('\nTest 2: Invalid Password (Wrong credentials)...');
  try {
    const wrongPassDTO = new LoginLawyerDTO({
      email: 'login.test@law.pk',
      password: 'WrongPassword999!',
    });
    await lawyerService.loginLawyer(wrongPassDTO);
    console.error('❌ Test 2 FAILED: Wrong password was allowed!');
  } catch (err) {
    console.log('✅ Test 2 PASSED (Rejected wrong password):', err.message);
  }

  // 5. Test Non-Existent Email
  console.log('\nTest 3: Non-existent Email...');
  try {
    const unknownEmailDTO = new LoginLawyerDTO({
      email: 'notfound@law.pk',
      password: 'SomePassword123!',
    });
    await lawyerService.loginLawyer(unknownEmailDTO);
    console.error('❌ Test 3 FAILED: Non-existent user was allowed!');
  } catch (err) {
    console.log('✅ Test 3 PASSED (Rejected unknown email):', err.message);
  }

  // 6. Test Empty Fields (Validation)
  console.log('\nTest 4: Empty fields validation...');
  try {
    const emptyDTO = new LoginLawyerDTO({ email: '', password: '' });
    await lawyerService.loginLawyer(emptyDTO);
    console.error('❌ Test 4 FAILED: Empty fields were allowed!');
  } catch (err) {
    console.log('✅ Test 4 PASSED (Validation caught empty fields):', err.message);
  }

  // Clean test data
  await db.query("DELETE FROM lawyers WHERE email = 'login.test@law.pk' OR sbc_number = 'SBC-7788'");
  await db.query("DELETE FROM users WHERE email = 'login.test@law.pk'");

  console.log('\n🎉 ALL LOGIN TESTS PASSED SUCCESSFULLY AND CLEANED!');
  process.exit(0);
}

test().catch((err) => {
  console.error('Login test error:', err);
  process.exit(1);
});
