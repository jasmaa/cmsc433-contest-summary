/**
 * Error message
 * 
 * @param {*} param0 
 * @returns 
 */
export default function ErrorMessage({ msg }) {
  return (
    <span className="font-semibold text-red-500 py-2">
      Error: {msg}
    </span>
  );
}