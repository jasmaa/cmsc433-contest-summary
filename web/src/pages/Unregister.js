import { useState, useEffect } from 'react';
import { Redirect } from "react-router-dom";

import client from 'services/axios';

/**
 * Unregister page
 * 
 * @param {*} param0 
 * @returns 
 */
export default function Unregister({ location }) {

  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  const code = params.get('code');

  const [isDone, setIsDone] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setIsError(true);
      } else {
        try {
          await client.get(encodeURI(`/unregister?email=${email}&code=${code}`));
        } catch (e) {
          setIsError(true);
        }
      }

      setIsDone(true);
    };
    unsubscribe();
  }, []);

  if (!isDone) {
    return <h1>loading</h1>
  }

  if (isError) {
    return <Redirect to="/" />
  }

  return (
    <div className="grid grid-rows-none rounded shadow-xl m-5 p-5">
      <h1 className="text-4xl text-center font-bold">Successfully unsubscribed {email}</h1>
    </div>
  );
}