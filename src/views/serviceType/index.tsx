import { useState, useEffect } from "react";
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import { API_URL, fetcherWithCredentials, FILE_URL } from "../../constants";
import useSWR, { mutate } from "swr";
import Loader from "../../components/common/Loader";
import Alert from "../../components/Alert";
import { CiSearch } from "react-icons/ci";
import { Link } from "react-router-dom";
import { PiEyeLight, PiTrash } from "react-icons/pi";
import DeleteModal from "../../modal/DeleteModal";
import toast from "react-hot-toast";

/** Debounce hook to delay search input */
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ServiceTypes = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState("");
  const [selectIdd, setSelectIdd] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounced search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build query parameters
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (debouncedSearchTerm) {
    query.append("search", debouncedSearchTerm);
  }

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    `${API_URL}/service-types?${query.toString()}`,
    fetcherWithCredentials
  );

  const onConfirmDelete = async () => {
    try {
      toast.loading("Deleting service...");
      setLoading(true);
      await fetch(`${API_URL}/service-type/${selectIdd}`, {
        method: "DELETE",
        headers: {
          "auth-token": `${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (!res.error) {
            setDeleteModal(false);
            toast.dismiss();
            toast.success("Service deleted successfully");
            setLoading(false);
            // Refetch data
            mutate(`${API_URL}/service-types?${query.toString()}`);
          } else {
            toast.dismiss();
            toast.error("Something went wrong");
            setLoading(false);
          }
        })
        .catch(() => {
          toast.dismiss();
          toast.error("Something went wrong");
          setLoading(false);
        });
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      {isLoading ? (
        <Loader opacity={true} />
      ) : (
        <div className="h-screen">
          {data?.error || error ? (
            <Alert
              title="Something went wrong"
              message={
                data?.message || "An error occurred while fetching data."
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                  <Link
                    to="/add-service-type"
                    className="bg-[#40A579] py-3 px-5 text-center text-sm font-medium text-white hover:bg-[#40A579] hover:text-white md:text-base"
                  >
                    Add Service Type
                  </Link>
                </div>

                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      placeholder="Search for services"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579]"
                    />
                    <span className="absolute right-4 top-4">
                      <CiSearch className="text-xl text-[#40A579]" />
                    </span>
                  </div>
                </div>

                {/* Services Data */}
                <div className="w-full">
                  {data && data.serviceTypes && data.serviceTypes.length > 0 ? (
                    <>
                      {/* Mobile View */}
                      <div className="block md:hidden">
                        {data.serviceTypes.map(
                          (service: any, index: number) => (
                            <div
                              key={index}
                              className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                            >
                              <div className="mb-2">
                                <span className="font-semibold">Title:</span>{" "}
                                {service?.type}
                              </div>

                              <div className="flex gap-2">
                                <Link to={`/service/${service._id}`}>
                                  <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                                </Link>
                                <div
                                  onClick={() => {
                                    setSelectIdd(service._id);
                                    setDeleteModal(true);
                                  }}
                                >
                                  <PiTrash className="cursor-pointer text-2xl text-red-900" />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {/* Desktop View */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full table-auto text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              {/* <th scope="col" className="px-4 py-2">
                                Id
                              </th> */}
                              <th scope="col" className="px-4 py-2">
                                Servie Type
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Icon
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.serviceTypes.map(
                              (service: any, index: number) => (
                                <tr
                                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                  key={index}
                                >
                                  {/* <td className="px-4 py-2">{service._id}</td> */}
                                  <td className="px-4 py-2">{service?.type}</td>
                                  <td className="px-4 py-2">
                                    {service.image && (
                                      <img
                                        src={`${FILE_URL}${service?.image}`}
                                        alt="service picture"
                                        style={{
                                          width: "100px",
                                        }}
                                      />
                                    )}
                                  </td>

                                  <td className="flex cursor-pointer gap-2">
                                    <Link to={`/service-type/${service._id}`}>
                                      <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                                    </Link>
                                    <div
                                      onClick={() => {
                                        setSelectIdd(service._id);
                                        setDeleteModal(true);
                                      }}
                                    >
                                      <PiTrash className="cursor-pointer text-2xl text-red-900" />
                                    </div>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div>No services found.</div>
                  )}
                </div>

                {/* Pagination Controls */}
                {data && (
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Page {page} of {data.totalPages}, Total services:{" "}
                        {data.totalServiceTypes || 0}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 bg-[#40A579] text-white rounded-md"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                      <button
                        className="px-4 py-2 bg-[#40A579] text-white rounded-md"
                        onClick={() => setPage(page + 1)}
                        disabled={page === data.totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delete Confirmation Modal */}
              {deleteModal && (
                <DeleteModal
                  onCancel={() => setDeleteModal(false)}
                  onConfirm={onConfirmDelete}
                  type="booking"
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default ServiceTypes;
