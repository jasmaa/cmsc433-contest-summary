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
      rank: parseInt(arr[1]),
      runs: runs.map(runArr => {
        const v = parseFloat(runArr[1]);
        return !isNaN(v) ? v : runArr[1];
      }),
      score: arr[4] === 'FAILED' ? arr[4] : parseInt(arr[4]),
    };
  });
}

/**
 * Get dated lookups from store
 * 
 * @param {*} now 
 * @param {*} daysBack 
 * @returns 
 */
export async function fetchDatedLookups(options = {}) {

  const now = options.now || new Date();
  const daysBack = Math.max(1, Math.min(options.daysBack || 5, 30));

  const dateKeys = [...Array(daysBack).keys()].map(i => {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    return d.toISOString().substring(0, 10);
  });

  const datedLookups = await Promise.all(
    dateKeys.map(dateKey =>
      BOARDS.get(dateKey).then(board => {
        return {
          dateKey,
          lookup: board2lookup(JSON.parse(board)),
        }
      })
    )
  );

  return datedLookups;
}

/**
 * Convert board to lookup
 * 
 * @param {*} board 
 * @returns 
 */
function board2lookup(board) {
  const lookup = {};
  if (board === null) {
    return lookup;
  }
  for (let i = 0; i < board.length; i++) {
    const user = board[i];
    lookup[user.name] = user;
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
export function generateRankingChartData(name, datedLookups) {
  const names = Object.keys(datedLookups[0].lookup);
  const reversedDatedLookups = [...datedLookups].reverse();
  return {
    labels: reversedDatedLookups.map(({ dateKey }) => dateKey),
    datasets: names.map(v => {
      const color = v === name ? 'cornflowerblue' : 'gainsboro';
      return {
        label: v,
        data: reversedDatedLookups.map(({ lookup }) => lookup[v] ? lookup[v].rank : Infinity),
        fill: false,
        borderColor: color,
        pointBackgroundColor: color,
      };
    }),
  };
}

/**
 * Generate radar chart data for runtimes
 * 
 * @param {*} name 
 * @param {*} lookup 
 * @returns 
 */
export function generateRuntimesChartData(name, lookup) {
  const names = Object.keys(lookup);
  const nRuns = lookup[names[0]].runs.length;
  return {
    labels: [...Array(nRuns).keys()].map(i => `Maze #${i + 1}`),
    datasets: names.map(v => {
      const color = v === name ? 'cornflowerblue' : 'gainsboro';
      return {
        label: v,
        data: lookup[v].runs.map(t => Number.isFinite(t) ? Math.log(t + 1) : Infinity),
        fill: false,
        borderColor: color,
        pointBackgroundColor: color,
      };
    }),
  };
}