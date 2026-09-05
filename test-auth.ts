import { SignJWT } from 'jose';

async function run() {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const jwt = await new SignJWT({
    sub: '9b9e61f5-40b2-44b9-8df9-5b5a1886f0b6',
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  const res = await fetch('http://localhost:3000/api/modules/4d982d09-7389-422a-829b-46f5a6b610e4/toggle', {
    method: 'POST',
    headers: {
      'Cookie': `brevet_session=${jwt}`
    }
  });

  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('BODY:', text);
}
run();
