import { useState, useEffect } from 'react';
import { Line, Radar } from 'react-chartjs-2';
import { useDebounce } from 'use-debounce';
import * as LZString from 'lz-string';

import client from 'services/axios';

/**
 * Chart
 * 
 * @param {*} param0 
 * @returns 
 */
export default function Chart() {

  const [name, setName] = useState('');
  const [nameQuery] = useDebounce(name, 100);
  const [isDone, setIsDone] = useState(false);
  const [rankingHistory, setRankingHistory] = useState(null);
  const [runtimes, setRuntimes] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await client.get(encodeURI(`/chart?name=${name}`));
        setRankingHistory(JSON.parse(LZString.decompress(res.data.rankingHistory)));
        setRuntimes(JSON.parse(LZString.decompress(res.data.runtimes)));
      } catch (e) {
        console.log(e);
      }

      setIsDone(true);
    };
    fetchChart();
  }, []);

  useEffect(() => {
    if (!rankingHistory || !runtimes) {
      return;
    }

    const newRankingHistoryDatasets = rankingHistory.datasets.map(dataset => {
      const isTarget = dataset.label === nameQuery
      const color = isTarget ? 'cornflowerblue' : 'gainsboro';
      const order = isTarget ? 0 : 1;
      return {
        ...dataset,
        borderColor: color,
        pointBackgroundColor: color,
        order,
      }
    });

    setRankingHistory({
      ...rankingHistory.data,
      datasets: newRankingHistoryDatasets,
    });

    const newRuntimesDatasets = runtimes.datasets.map(dataset => {
      const isTarget = dataset.label === nameQuery
      const color = isTarget ? 'cornflowerblue' : 'gainsboro';
      const order = isTarget ? 0 : 1;
      return {
        ...dataset,
        borderColor: color,
        pointBackgroundColor: color,
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        fill: isTarget,
        order,
      }
    });

    setRuntimes({
      ...runtimes.data,
      datasets: newRuntimesDatasets,
    });

  }, [nameQuery]);

  if (!isDone) {
    return <h1>loading</h1>
  }

  return (
    <div className="grid grid-rows-none rounded shadow-xl m-5 p-5">
      <input
        className="border-2 border-gray-300 bg-gray-100 rounded p-2 outline-none mb-3"
        value={name}
        placeholder="Name"
        onChange={e => {
          setName(e.target.value);
        }}
      />

      <Line
        data={rankingHistory}
        options={{
          title: {
            text: 'Ranking History',
            display: true,
          },
          animation: {
            duration: 0,
          },
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
        }}
      />

      <Radar
        data={runtimes}
        options={{
          title: {
            text: 'Current Runtimes (log scale)',
            display: true,
          },
          animation: {
            duration: 0,
          },
          legend: false,
        }}
      />
    </div>
  );
}