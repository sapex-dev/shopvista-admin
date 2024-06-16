import ProductTable from "../components/Product/ProductTable";

const Products = () => {
  return (
    <div className="p-4 sm:ml-64">
      <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="flex  place-items-start justify-start h-16 rounded dark:bg-gray-800">
            <div className="pb-4 bg-white dark:bg-gray-900">
              <div className="flex items-center justify-center my-4 text-2xl font-bold">
                <h2 className="text-blue-700">Products Details</h2>
              </div>
            </div>
          </div>
          <div className="flex  items-center justify-center h-16 rounded dark:bg-gray-800"></div>
        </div>
        <div className="flex flex-col items-center justify-center mb-4 rounded bg-gray-50 dark:bg-gray-800">
          <ProductTable />
        </div>
      </div>
    </div>
  );
};

export default Products;
