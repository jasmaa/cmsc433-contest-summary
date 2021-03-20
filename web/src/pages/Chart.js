import { useState, useEffect } from 'react';
import { Redirect } from "react-router-dom";
import { Line } from 'react-chartjs-2';

import client from 'services/axios';

/**
 * Chart page
 * 
 * @param {*} param0 
 * @returns 
 */
export default function Chart({ location }) {

  const params = new URLSearchParams(location.search);
  const name = params.get('name');

  const [isDone, setIsDone] = useState(false);
  const [isError, setIsError] = useState(false);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const fetchChart = async () => {
      if (!name) {
        setIsError(true);
      } else {
        try {
          const res = await client.get(encodeURI(`/chart?name=${name}`));
          setChartData(res.data);
        } catch (e) {
          setIsError(true);
        }
      }

      setIsDone(true);
    };
    fetchChart();
  }, []);

  if (!isDone) {
    return <h1>loading</h1>
  }

  if (isError) {
    return <Redirect to="/" />
  }

  return (
    <div className="grid grid-rows-none rounded shadow-xl m-5 p-5">
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
    </div>
  );
}