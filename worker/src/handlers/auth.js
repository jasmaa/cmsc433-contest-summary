import { sendEmailTemplate } from '../sendGrid';
import { uuidv4, validateEmail } from '../utils';

/**
 * Handles register
 * 
 * @param {*} request 
 */
export async function register(request) {
  if (request.method != 'POST') {
    return new Response('Method not supported', { status: 405 });
  }

  const { headers } = request;
  const contentType = headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    return new Response('Content type was not json', { status: 400 });
  }

  const { email, name } = await request.json();
  if (!email) {
    return new Response('Missing required field "email"', { status: 400, });
  }
  if (!name) {
    return new Response('Missing required field "name"', { status: 400 });
  }

  // Fail if email is invalid
  if (!validateEmail(email)) {
    return new Response('Email is invalid', { status: 400 });
  }

  // Fail if user already verified
  const res = JSON.parse(await USERS.get(email));
  if (res && res.verified) {
    return new Response('User already verified', { status: 400 });
  }

  const code = uuidv4();
  await USERS.put(email, JSON.stringify({
    name,
    code,
    verified: false,
  }));

  // Send email with code
  const emailRes = await sendEmailTemplate({
    email,
    subject: 'CMSC433 Notifier: Verify Email',
    templateID: VERIFY_TEMPLATE_ID,
    data: {
      verify: `${WEB_URL}/verify?email=${email}&code=${code}`,
    }
  });
  if (emailRes.status != 202) {
    console.log(`${emailRes.status}: ${emailRes.statusText}`);
  }

  return new Response('Successfully registered');
}

/**
 * Handles verify
 * 
 * @param {*} request 
 */
export async function verify(request) {
  if (request.method != 'GET') {
    return new Response('Method not supported', { status: 405 });
  }

  const url = new URL(request.url);
  const params = url.searchParams;

  const email = params.get('email');
  if (!email) {
    return new Response('Failed to verify"', { status: 400 });
  }
  const code = params.get('code');
  if (!code) {
    return new Response('Failed to verify"', { status: 400 });
  }

  // Fail if no record
  const res = JSON.parse(await USERS.get(email));
  if (!res) {
    return new Response('Failed to verify', { status: 400 });
  }

  // Fail if verified
  if (res && res.verified) {
    return new Response('User already verified', { status: 400 });
  }

  // Fail if codes do not match
  if (code !== res.code) {
    return new Response('Failed to verify', { status: 400 });
  }

  // Verify and re-gen code
  res.verified = true;
  res.code = uuidv4();
  await USERS.put(email, JSON.stringify(res));

  return new Response('Successfully verified');
}

/**
 * Handles unregister
 * 
 * @param {*} request 
 */
export async function unregister(request) {
  if (request.method != 'GET') {
    return new Response('Method not supported', { status: 405 });
  }

  const url = new URL(request.url);
  const params = url.searchParams;

  const email = params.get('email');
  if (!email) {
    return new Response('Missing required field "email"', { status: 400 });
  }
  const code = params.get('code');
  if (!email) {
    return new Response('Missing required field "code"', { status: 400 });
  }

  // Fail if no record
  const res = JSON.parse(await USERS.get(email));
  if (!res) {
    return new Response('Failed to unregister', { status: 400 });
  }

  // Fail if codes do not match
  if (code !== res.code) {
    return new Response('Failed to unregister', { status: 400 });
  }

  await USERS.delete(email);

  return new Response('Successfully unregistered');
}