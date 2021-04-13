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
  const [name2, setName2] = useState('');
  const [nameQuery2] = useDebounce(name2, 100);
  const [isDone, setIsDone] = useState(false);
  const [rankingHistory, setRankingHistory] = useState(null);
  const [displayRankingHistory, setDisplayRankingHistory] = useState(null);
  const [runtimes, setRuntimes] = useState(null);
  const [displayRuntimes, setDisplayRuntimes] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isShowAll, setIsShowAll] = useState(false);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await client.get(encodeURI(`/chart`));

        const initialRankingHistoryData = LZString.decompress(res.data.rankingHistory);
        setRankingHistory(JSON.parse(initialRankingHistoryData));
        setDisplayRankingHistory({
          ...JSON.parse(initialRankingHistoryData),
          datasets: [],
        });

        const initialRuntimesData = LZString.decompress(res.data.runtimes);
        setRuntimes(JSON.parse(initialRuntimesData));
        setDisplayRuntimes({
          ...JSON.parse(initialRuntimesData),
          datasets: [],
        });
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

    /**
     * Filter and color datasets
     * 
     * @param {*} datasets 
     * @param {*} isFill 
     * @returns 
     */
    const processDatasets = (datasets, isFill) => {
      return datasets
        .filter(dataset => isShowAll || dataset.label === name || isComparing && dataset.label === name2)
        .map(dataset => {
          // Set initial colors
          return {
            ...dataset,
            borderColor: 'gainsboro',
            pointBackgroundColor: 'gainsboro',
            fill: false,
            order: 1,
          }
        })
        .map(dataset => {
          // Highlight name 1
          if (dataset.label === name) {
            return {
              ...dataset,
              borderColor: 'cornflowerblue',
              pointBackgroundColor: 'cornflowerblue',
              backgroundColor: 'rgba(0, 0, 255, 0.3)',
              fill: isFill,
              order: 0,
            }
          } else {
            return dataset;
          }
        })
        .map(dataset => {
          // Highlight name 2 if comparing
          if (isComparing && dataset.label === name2) {
            return {
              ...dataset,
              borderColor: 'orange',
              pointBackgroundColor: 'orange',
              backgroundColor: 'rgba(232, 126, 4, 0.3)',
              fill: isFill,
              order: 0,
            }
          } else {
            return dataset;
          }
        });
    }

    const newRankingHistoryDatasets = processDatasets(rankingHistory.datasets, false);
    setDisplayRankingHistory(JSON.parse(JSON.stringify({
      ...rankingHistory.data,
      datasets: newRankingHistoryDatasets,
    })));

    const newRuntimesDatasets = processDatasets(runtimes.datasets, true);
    setDisplayRuntimes(JSON.parse(JSON.stringify({
      ...runtimes.data,
      datasets: newRuntimesDatasets,
    })));
  }, [name, name2, isShowAll, isComparing]);

  if (!isDone) {
    return <h1>loading</h1>
  }

  return (
    <div className="rounded shadow-xl m-5 p-5">
      <div className="grid grid-cols-12 gap-2 my-5">
        <input
          className="border-2 border-gray-300 bg-gray-100 rounded p-2 outline-none mb-3 col-span-full"
          value={name}
          placeholder="Name"
          onChange={e => {
            setName(e.target.value);
          }}
        />
        {
          isComparing
            ? (
              <>
                <button className="rounded bg-yellow-200 md:col-span-1 col-span-3" onClick={() => {
                  const temp = name;
                  setName(name2);
                  setName2(temp);
                }}>↕ Switch</button>
                <input
                  className="border-2 border-gray-300 bg-gray-100 rounded p-1 outline-none mb-3 md:col-span-11 col-span-9 h-full"
                  value={name2}
                  placeholder="Competitor Name"
                  onChange={e => {
                    setName2(e.target.value);
                  }}
                />
              </>
            )
            : <></>
        }

        <div className="col-span-full">
          <label htmlFor="compareWith" className="mr-2">Compare</label>
          <input id="compareWith" type="checkbox" checked={isComparing} onChange={() => setIsComparing(!isComparing)} />
        </div>

        <div className="col-span-full">
          <label htmlFor="showAll" className="mr-2">Show all competitors</label>
          <input id="showAll" type="checkbox" checked={isShowAll} onChange={() => setIsShowAll(!isShowAll)} />
        </div>
      </div>

      <hr />

      <Line
        data={displayRankingHistory}
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
        data={displayRuntimes}
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