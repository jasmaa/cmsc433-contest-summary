/**
 * Page layout
 * 
 * @param {*} param0 
 * @returns 
 */
export default function Layout({ children }) {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-12">
        <div className="col-span-full md:col-start-3 md:col-end-11">
          {children}
        </div>
      </div>
    </div>
  );
}