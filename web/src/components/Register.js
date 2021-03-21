import ErrorMessage from 'components/ErrorMessage';
import { useState } from 'react';
import client from 'services/axios';

/**
 * Register widget
 * 
 * @returns 
 */
export default function Register() {

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (isDone) {
    return (
      <div className="grid grid-rows-none rounded shadow-xl m-5 p-5">
        <h1 className="text-4xl text-center font-bold">Successfully signed up!</h1>
        <span className="text-xl text-center mt-5">Check your inbox to verify your email.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-none rounded shadow-xl m-5 p-5">
      <h1 className="text-4xl font-bold mb-3">Subscribe</h1>
      <h1 className="text-lg mb-3">Get notified of contest updates daily.</h1>

      {
        errorMsg
          ? <ErrorMessage msg={errorMsg} />
          : <></>
      }

      <form
        className="grid grid-rows-none gap-4 mt-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await client.post(
              '/register',
              { email, name },
            );
            setIsDone(true);
          } catch (e) {
            setErrorMsg(e.response.data);
          }
        }}
      >
        <input
          className="border-2 border-gray-300 bg-gray-100 rounded p-2 outline-none"
          type="email"
          value={email}
          placeholder="Email"
          onChange={e => {
            setEmail(e.target.value);
          }}
        />
        <input
          className="border-2 border-gray-300 bg-gray-100 rounded p-2 outline-none"
          value={name}
          placeholder="Name"
          onChange={e => {
            setName(e.target.value);
          }}
        />
        <button
          className="bg-blue-500 text-white rounded p-2 outline-none mt-3"
          type="submit"
        >Subscribe!</button>
      </form>
    </div>
  );
}