import { fetchDatedLookups, fetchLeaderboard, generateRankingChartData } from './leaderboard';
import { sendEmailTemplate } from './sendGrid';
import { uuidv4, validateEmail, zip } from './utils';

/**
 * Handles get list
 * @param {*} request 
 * @returns 
 */
export async function list(request) {
  if (request.method == 'GET') {
    const data = await fetchLeaderboard();
    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    );
  }
  return new Response(null, { status: 405 });
}

/**
 * Generate ranking chart for user
 * 
 * @param {*} request 
 * @returns 
 */
export async function chart(request) {
  if (request.method == 'GET') {
    const url = new URL(request.url);
    const params = url.searchParams;

    const name = params.get('name');
    if (!name) {
      return new Response('Parameter "name" is required,', { status: 400 });
    }
    const daysBack = parseInt(params.get('daysBack'));

    const datedLookups = await fetchDatedLookups({ daysBack });
    const chartData = generateRankingChartData(name, datedLookups);

    return new Response(
      JSON.stringify(chartData),
      { headers: { "Content-Type": "application/json" } },
    );
  }
  return new Response(null, { status: 405 });
}

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

/**
 * Updates board and notifies users
 */
export async function updateAndNotify() {
  const currentBoard = await fetchLeaderboard();
  await updateBoard(currentBoard);
  console.log('Board updated.');

  // Generate lookups for past days
  const datedLookups = await fetchDatedLookups();
  console.log('Generated dated lookups.');

  await notifySubscribers(currentBoard, datedLookups);
  console.log('Subscribers notified.');
}

/**
 * Scheduled board update
 * 
 * @param {*} scheduledDate 
 */
async function updateBoard(board) {
  const dateKey = new Date().toISOString().substring(0, 10);
  await BOARDS.put('current', JSON.stringify(board));
  await BOARDS.put(dateKey, JSON.stringify(board));
}

/**
 * Notify subscribers
 * 
 * @param {*} scheduledDate 
 */
async function notifySubscribers(currentBoard, datedLookups) {

  const currentLookup = datedLookups[0].lookup;

  // Filter out unverified emails
  const emails = (await USERS.list())
    .keys.map(v => v.name);
  const users = (await Promise.all(emails.map(email => USERS.get(email))))
    .map(user => JSON.parse(user));
  const validUsers = [...zip(emails, users)]
    .filter(([_, { verified }]) => verified)
    .map(([email, user]) => {
      return { ...user, email };
    });

  // Determine and send message
  for (const { name, email, code } of validUsers) {
    const chartData = generateRankingChartData(name, datedLookups);
    const chart = {
      type: 'line',
      data: chartData,
      options: {
        legend: false,
        scales: {
          yAxes: [{
            ticks: {
              reverse: true,
              min: 1,
              stepSize: 1,
            }
          }]
        }
      },
    };
    const data = {
      name: name,
      rank: currentLookup[name] ? currentLookup[name].rank : 'Unranked',
      rankers: currentBoard.slice(0, 15).map(({ name }) => currentLookup[name]),
      chartSrc: `https://quickchart.io/chart?c=${JSON.stringify(chart)}`, // TODO: find alternative?
      unsubscribe: `${WEB_URL}/unregister?email=${email}&code=${code}`,
    };

    const emailRes = await sendEmailTemplate({
      email,
      subject: 'CMSC433 Contest Update',
      templateID: UPDATE_TEMPLATE_ID,
      data,
    });
    if (emailRes.status != 202) {
      console.log(`Error sending mail to ${email}`);
    }
  }
}