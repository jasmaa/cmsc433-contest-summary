/**
 * Parse scores from leaderboard
 * 
 * @returns 
 */
export async function fetchLeaderboard() {
  const req = new Request(SCOREBOARD_URL, { method: 'GET' });
  const res = await fetch(req);

  let html = await res.text();
  html = html.replace(/\s/g, '');

  const tableRows = [...html.matchAll(
    /<tr><td>(\d+)<\/td><td>(\w{1,12})<\/td>((?:<td>(?:<b>)?(?:\d+(?:\.\d+)?(?:<\/b>)?\(\d+\)|bad|err|ovr)<\/td>){7})<td>(\d+|FAILED)<\/td><\/tr>/g
  )];

  return tableRows.map(arr => {

    const runs = [...arr[3].matchAll(
      /<td>(?:<b>)?(\d+(?:\.\d+)?(?:<\/b>)?\(\d+\)|bad|err|ovr)<\/td>/g
    )];

    return {
      name: arr[2],
      runs: runs.map(runArr => {
        const v = parseFloat(runArr[1]);
        return !isNaN(v) ? v : runArr[1];
      }),
      score: arr[4] === 'FAILED' ? arr[4] : parseInt(arr[4]),
    };
  });
}

/**
 * Convert board to lookup
 * 
 * @param {*} board 
 * @returns 
 */
export function board2lookup(board) {
  const lookup = {};
  if (board === null) {
    return lookup;
  }
  for (let i = 0; i < board.length; i++) {
    const user = board[i];
    lookup[user.name] = { ...user, rank: i + 1 };
  }
  return lookup;
}

/**
 * Generate ranking chart for user
 * 
 * @param {*} name 
 * @param {*} datedLookups 
 * @returns 
 */
export function generateRankingChart(name, datedLookups) {
  const reversedDatedLookups = [...datedLookups].reverse();
  return {
    type: 'line',
    data: {
      labels: reversedDatedLookups.map(({ dateKey }) => dateKey),
      datasets: [{
        label: name,
        data: reversedDatedLookups.map(({ lookup }) => lookup[name] ? lookup[name].rank : Infinity),
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            reverse: true,
          }
        }]
      }
    },
  }
}