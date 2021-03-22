import { fetchDatedLookups, fetchLeaderboard, generateRankingChartData, generateRuntimesChartData } from '../leaderboard';
import * as LZString from 'lz-string';

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
    const daysBack = parseInt(params.get('daysBack'));

    const datedLookups = await fetchDatedLookups({ daysBack });
    const rankingHistory = generateRankingChartData(name, datedLookups);
    const runtimes = generateRuntimesChartData(name, datedLookups[0].lookup);

    return new Response(
      JSON.stringify({
        rankingHistory: LZString.compress(JSON.stringify(rankingHistory)),
        runtimes: LZString.compress(JSON.stringify(runtimes)),
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  }
  return new Response(null, { status: 405 });
}

