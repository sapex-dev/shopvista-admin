import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allStocks, updateStock } from "../../services/Stock/stockAPI";
import { Modal } from "flowbite-react";
import { useState } from "react";
import getAllProduct from "../../hooks/getAllProduct";
import { getProductEdit } from "../../services/Product/productAPI";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

const StockTable = () => {
  const { data: productName, isSuccess: productNameGetSuccess } =
    getAllProduct();
  console.log("🚀 ~ StockTable ~ productName:", productName);
  const queryClient = useQueryClient();

  // <-------- Get All Stocks -------->
  const { isSuccess, isFetching, data } = useQuery({
    queryKey: ["allStocks"],
    queryFn: allStocks,
    refetchOnWindowFocus: false,
    select: (data) => data?.reverse(),
  });

  //<-------------- Update Stock ---------->
  const { mutate } = useMutation({
    mutationFn: (data) => updateStock(data),
    onSuccess: (response) => {
      console.log("response", response);
      toast.success("Stock Updated Successfully 🥳");
      queryClient.invalidateQueries("allStocks");
      handleModalClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [modalOpen, setModalOpen] = useState({ isOpen: false, action: null });
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [stockUpdateDataWithId, setStockUpdateDataWithId] = useState([]);
  const [stockUpdateDataWithName, setStockUpdateDataWithName] = useState([]);

  console.log("🚀 ~ StockTable ~ colorOptions:", colorOptions);
  const {
    control,
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    const selectedProduct = JSON.parse(data.selectedProductModal);
    const selectedColor = JSON.parse(data.selectedColorModal);
    const selectedSize = JSON.parse(data.selectedSizeModal);
    const quantityChange = +data.quantityModal;

    const existingEntryIndex = stockUpdateDataWithId.findIndex(
      (entry) =>
        entry.productId === selectedProduct._id &&
        entry.colorId === selectedColor._id &&
        entry.sizeId === selectedSize._id
    );

    if (existingEntryIndex !== -1) {
      // Entry exists, update quantity
      const updatedDataWithId = [...stockUpdateDataWithId];
      updatedDataWithId[existingEntryIndex].quantityChange += quantityChange;
      setStockUpdateDataWithId(updatedDataWithId);

      // Similarly, update the entry in the other array
      const updatedDataWithName = [...stockUpdateDataWithName];
      updatedDataWithName[existingEntryIndex].quantityChange += quantityChange;
      setStockUpdateDataWithName(updatedDataWithName);
    } else {
      // Entry does not exist, add a new entry
      const newRowDataWithId = {
        productId: selectedProduct._id,
        colorId: selectedColor._id,
        sizeId: selectedSize._id,
        quantityChange: quantityChange,
        action: modalOpen.action,
      };

      const newRowDataWithName = {
        productId: selectedProduct.name,
        colorId: selectedColor.name,
        sizeId: selectedSize.name,
        quantityChange: quantityChange,
        action: modalOpen.action,
      };

      setStockUpdateDataWithId((prevData) => [...prevData, newRowDataWithId]);
      setStockUpdateDataWithName((prevData) => [
        ...prevData,
        newRowDataWithName,
      ]);
    }

    reset();
  };

  const handleProductChange = async (product) => {
    try {
      console.log("🚀 ~ handleProductChange ~ product:", product);
      const productData = JSON.parse(product);
      console.log("🚀 ~ handleProductChange ~ productData:", productData);
      const { slug, name } = productData;
      console.log("🚀 ~ handleProductChange ~ name:", name);
      console.log("🚀 ~ handleProductChange ~ _id:", slug);
      setValue("selectedProduct", name);
      // setSelectedProduct({ id: _id, name: name });
      // Make an API call to get color and size options for the selected product
      const productDetails = await getProductEdit(slug);
      console.log(
        "🚀 ~ handleProductChange ~ productDetails:",
        productDetails.data.data
      );
      setColorOptions(productDetails.data.data.color);
      setSizeOptions(productDetails.data.data.size);
    } catch (error) {
      console.error("Error fetching product details", error);
    }
  };

  const handleModalClose = () => {
    setModalOpen({ isOpen: false, action: null });
    setStockUpdateDataWithId([]);
    setStockUpdateDataWithName([]);
    reset();
  };

  const onSubmitStock = () => {
    console.log("onsubmit");
    stockUpdateDataWithId.map((stock) => {
      mutate(stock);
    });
  };

  return (
    <>
      <div className="sm:flex my-4 ml-2 w-full">
        <div className="items-center hidden mb-3 sm:flex sm:divide-x sm:divide-gray-100 sm:mb-0 dark:divide-gray-700">
          {/* <form className="lg:pr-3" action="#" method="GET">
            <label htmlFor="users-search" className="sr-only">
              Search
            </label>
            <div className="relative mt-1 lg:w-64 xl:w-96">
              <input
                type="text"
                name="email"
                id="users-search"
                className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search for users"
                style={{
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "20px",
                  backgroundPosition: "97% center",
                  cursor: "auto",
                }}
                data-temp-mail-org={2}
              />
            </div>
          </form> */}
          {/* <div className="flex pl-0 mt-3 space-x-1 sm:pl-2 sm:mt-0">
            <a
              href="#"
              className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </a>
          </div> */}
        </div>
        <div className="flex items-center ml-auto space-x-2 sm:space-x-3">
          <button
            type="button"
            data-modal-toggle="add-user-modal"
            className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 sm:w-auto dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            onClick={() => setModalOpen({ isOpen: true, action: "add" })}
          >
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Stock
          </button>
          <button
            type="button"
            data-modal-toggle="add-user-modal"
            className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 sm:w-auto dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
            onClick={() => setModalOpen({ isOpen: true, action: "remove" })}
          >
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Remove Stock
          </button>
          {/* <a
            href="#"
            className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            <svg
              className="w-5 h-5 mr-2 -ml-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                clipRule="evenodd"
              />
            </svg>
            Export
          </a> */}
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th
                      scope="col"
                      className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-1/10"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-1/10"
                    >
                      Color
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-2/10"
                    >
                      Size
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-2/10"
                    >
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {isSuccess &&
                    data.map((stock, index) => (
                      <tr
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        key={index}
                      >
                        <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {stock.product?.name}
                        </td>
                        <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <div
                            key={index}
                            style={{
                              backgroundColor: `${stock.color?.name}`,
                              width: "23px",
                              height: "23px",
                              borderRadius: "50%",
                            }}
                          ></div>
                        </td>
                        <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          <div className="bg-green-100 text-green-800 text-md font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 w-min">
                            {stock.size?.name}
                          </div>
                        </td>
                        <td className="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {stock.quantity}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* <div className="sticky bottom-0 right-0 items-center w-full p-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <a
              href="#"
              className="inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex justify-center p-1 mr-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                className="w-7 h-7"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                1-20
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                2290
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="#"
              className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg
                className="w-5 h-5 mr-1 -ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Previous
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Next
              <svg
                className="w-5 h-5 ml-1 -mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div> */}

        {/* Update Modal */}
        <Modal
          show={modalOpen.isOpen}
          size="lg"
          onClose={() => handleModalClose()}
          popup
        >
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Update Stock
              </h3>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex items-end  justify-between space-x-2 mb-2">
                  {/* Product Dropdown */}
                  <div className="w-1/5">
                    <label
                      htmlFor="product"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Product
                    </label>
                    <Controller
                      name="selectedProductModal"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          onChange={(e) => {
                            field.onChange(e);
                            handleProductChange(e.target.value);
                          }}
                          value={field.value}
                          className={`bg-gray-50 border border-gray-300
                        text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        >
                          <option value="">Select Product</option>
                          {productNameGetSuccess &&
                            productName?.products?.map((product, index) => (
                              <option
                                key={index}
                                value={JSON.stringify(product)}
                              >
                                {product?.name}
                              </option>
                            ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Color Dropdown */}
                  <div className="w-1/5">
                    <label
                      htmlFor="color"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Color
                    </label>
                    <Controller
                      name="selectedColorModal"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          onChange={field.onChange}
                          value={field.value}
                          className={`bg-gray-50 border border-gray-300
                text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        >
                          <option value="">Select Color</option>
                          {colorOptions.map((color, index) => (
                            <option key={index} value={JSON.stringify(color)}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Size Dropdown */}
                  <div className="w-1/5">
                    <label
                      htmlFor="size"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Size
                    </label>
                    <Controller
                      name="selectedSizeModal"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          onChange={field.onChange}
                          value={field.value}
                          className={`bg-gray-50 border border-gray-300
                text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                        >
                          <option value="">Select Size</option>
                          {sizeOptions.map((size, index) => (
                            <option key={index} value={JSON.stringify(size)}>
                              {size.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="w-1/5">
                    <label
                      htmlFor="quantity"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      {...register("quantityModal")}
                      className={`bg-gray-50 border border-gray-300
            text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                      placeholder="Quantity"
                    />
                    {errors.quantityModal && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.quantityModal.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Add Row
                  </button>
                </div>
              </form>
              {stockUpdateDataWithName?.length > 0 && (
                <form onSubmit={handleSubmit(onSubmitStock)}>
                  <div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Product
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Color
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Size
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                        {stockUpdateDataWithName?.map((row, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {row.productId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {row.colorId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {row.sizeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {row.quantityChange}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <button
                      // onSubmit={handleStockUpdate()}
                      type="submit"
                      className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Update Stock
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default StockTable;
