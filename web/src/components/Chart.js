import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

import client from 'services/axios';

/**
 * Chart
 * 
 * @param {*} param0 
 * @returns 
 */
export default function Chart() {

  const [name, setName] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await client.get(encodeURI(`/chart?name=${name}`));
        setChartData(res.data);
      } catch (e) {
        console.log(e);
      }

      setIsDone(true);
    };
    fetchChart();
  }, []);

  // TODO: debounce this
  useEffect(() => {
    if (!chartData) {
      return;
    }

    const newDatasets = chartData.datasets.map(dataset => {
      const isTarget = dataset.label === name
      const color = isTarget ? 'cornflowerblue' : 'gainsboro';
      const order = isTarget ? 0 : 1;
      return {
        ...dataset,
        borderColor: color,
        pointBackgroundColor: color,
        order,
      }
    });

    setChartData({
      ...chartData.data,
      datasets: newDatasets,
    });

  }, [name]);

  if (!isDone) {
    return <h1>loading</h1>
  }

  return (
    <div className="grid grid-rows-none rounded shadow-xl m-5 p-5">
      <h1 className="text-4xl font-bold mb-5">Rankings</h1>

      <Line
        data={chartData}
        options={{
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
      <input
        className="border-2 border-gray-300 bg-gray-100 rounded p-2 outline-none mt-3"
        value={name}
        placeholder="Name"
        onChange={e => {
          setName(e.target.value);
        }}
      />
    </div>
  );
}