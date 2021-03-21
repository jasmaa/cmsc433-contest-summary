import Register from "components/Register";
import Chart from 'components/Chart';

/**
 * Home page
 * 
 * @returns 
 */
export default function Home() {
  return (
    <div>
      <h1 className="text-6xl font-bold text-center mt-3 mb-10">CMSC433 Contest Notifier</h1>
      <Chart />
      <Register />
    </div>
  );
}