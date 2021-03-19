import { useState, useEffect } from 'react';
import { Redirect } from "react-router-dom";

import client from 'services/axios';

/**
 * Verify page
 * 
 * @param {*} param0 
 * @returns 
 */
export default function Verify({ location }) {

  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  const code = params.get('code');

  const [isDone, setIsDone] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!email || !code) {
        setIsError(true);
      } else {
        try {
          await client.get(encodeURI(`/verify?email=${email}&code=${code}`));
        } catch (e) {
          setIsError(true);
        }
      }

      setIsDone(true);
    };
    verify();
  }, []);

  if (!isDone) {
    return <h1>loading</h1>
  }

  if (isError) {
    return <Redirect to="/" />
  }

  return (
    <div className="grid grid-rows-none rounded shadow-xl m-5 p-5">
      <h1 className="text-4xl text-center font-bold">Successfully verified!</h1>
    </div>
  );
}