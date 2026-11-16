const fetch = globalThis.fetch;
const db = require('../config/db');

async function testRegister() {
  try {
    const payload = {
      fullName: 'Sindh TV News',
      channelName: 'Sindh TV News',
      resourcePerson: 'Director News Sindh TV',
      email: 'test_signup_sindhtv@barqeinsaf.tv',
      phone: '03001239999',
      district: 'Hyderabad',
      password: 'SindhTV@12345',
      confirmPassword: 'SindhTV@12345',
      mediaType: 'Sindhi Regional Channel',
      registrationNumber: 'PEMRA-STV-2004'
    };

    console.log('Testing POST http://localhost:5000/api/media/register ...');
    const res = await fetch('http://localhost:5000/api/media/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('HTTP Status Code:', res.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));

    if (res.status === 201 && data.success) {
      console.log('✓ Register API works perfectly! Media entity created with token.');

      // Clean up the test user from DB
      await db.query("DELETE FROM media WHERE email = 'test_signup_sindhtv@barqeinsaf.tv'");
      await db.query("DELETE FROM users WHERE email = 'test_signup_sindhtv@barqeinsaf.tv'");
      console.log('✓ Temporary test record cleaned up.');
      process.exit(0);
    } else {
      console.error('Failed response:', data);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testRegister();
