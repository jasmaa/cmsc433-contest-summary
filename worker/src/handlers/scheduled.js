import { fetchDatedLookups, fetchLeaderboard, generateRankingChartData } from '../leaderboard';
import { sendEmailTemplate } from '../sendGrid';
import { zip } from '../utils';

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
  await BOARDS.put(dateKey, JSON.stringify(board), { expirationTtl: 604800 }); // 60*60*24*7
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