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
 * Generates email message for name
 * 
 * @param {*} name 
 * @param {*} oldBoard 
 * @param {*} board 
 * @returns 
 */
export function generateMessage(name, oldBoard, board) {

  const isOnOldBoard = checkOnBoard(name, oldBoard);
  const isOnBoard = checkOnBoard(name, board);

  // TODO: make more sophisticated

  if (isOnOldBoard && !isOnBoard) {
    // Not on leaderboard anymore
    return `Hello ${name},\nYou are off the leaderboard.`
  } else if (!isOnOldBoard && isOnBoard) {
    // New to leaderboard
    return `Hello ${name},\nWelcome to the leaderboard!`;
  } else {
    // No message
    return null;
  }
}

/**
 * Check is user is on the board
 * 
 * @param {*} board 
 * @returns 
 */
function checkOnBoard(name, board) {
  for (const row of board) {
    if (row.name === name) {
      return true;
    }
  }
  return false;
};