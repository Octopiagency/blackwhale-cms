import { Suspense } from "react";
import DynamicTableExample from "../components/DynamicTableExample";

const TableExample = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dynamic Table Examples</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicTableExample />
      </Suspense>
    </div>
  );
};

export default TableExample;