import { useState, useEffect } from 'react';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import { API_URL, fetcherWithCredentials } from '../../constants';
import useSWR, { mutate } from 'swr';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { CiSearch } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { PiEyeLight } from 'react-icons/pi';
import DeleteModal from '../../modal/DeleteModal';
import toast from 'react-hot-toast';

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

const Services = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  // @ts-ignore
  const [selectIdd, setSelectIdd] = useState('');
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
    query.append('search', debouncedSearchTerm);
  }

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    `${API_URL}/all-services?${query.toString()}`,
    fetcherWithCredentials,
  );
  // Fetch categories for image mapping (first page large limit)
  const { data: catData } = useSWR(
    `${API_URL}/service-categories?page=1&limit=200`,
    fetcherWithCredentials,
  );
  const categoryMap = (catData?.data || []).reduce((acc: any, c: any) => {
    acc[c.title] = c;
    return acc;
  }, {});

  const onConfirmDelete = async () => {
    try {
      toast.loading('Deleting service...');
      setLoading(true);
      await fetch(`${API_URL}/service/${selectIdd}`, {
        method: 'DELETE',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(res => {
          if (!res.error) {
            setDeleteModal(false);
            toast.dismiss();
            toast.success('Service deleted successfully');
            setLoading(false);
            // Refetch data
            mutate(`${API_URL}/get-services-all?${query.toString()}`);
          } else {
            toast.dismiss();
            toast.error('Something went wrong');
            setLoading(false);
          }
        })
        .catch(() => {
          toast.dismiss();
          toast.error('Something went wrong');
          setLoading(false);
        });
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
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
                data?.message || 'An error occurred while fetching data.'
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      placeholder="Search for services"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579]"
                    />
                    <span className="absolute right-4 top-4">
                      <CiSearch className="text-xl text-[#40A579]" />
                    </span>
                  </div>
                </div>

                {/* Services Data */}
                <div className="w-full">
                  {data && data?.services && data?.services?.length > 0 ? (
                    <>
                      {/* Desktop View */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full table-auto text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              {/* <th scope="col" className="px-4 py-2">
                                Id
                              </th> */}
                              <th scope="col" className="px-4 py-2">
                                Povider Name
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Email
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Rating
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Fixed Price
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Category
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Cat. Image
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.services.map(
                              (service: any, index: number) => (
                                <tr
                                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                  key={index}
                                >
                                  <td className="px-4 py-2">
                                    {service?.user?.name}
                                  </td>
                                  <td className="px-4 py-2">
                                    {service?.user?.email}
                                  </td>
                                  <td className="px-4 py-2">
                                    {service?.user?.reviewStats?.totalRating ||
                                      'N/A'}
                                  </td>
                                  <td className="px-4 py-2">
                                    {service?.fixedPrice || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2">
                                    {service?.category || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2">
                                    {service?.category &&
                                    categoryMap[service.category]?.imageUrl ? (
                                      <img
                                        src={
                                          categoryMap[service.category].imageUrl
                                        }
                                        alt={service.category}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <span className="text-xs text-gray-400">
                                        —
                                      </span>
                                    )}
                                  </td>

                                  <td className="flex cursor-pointer gap-2">
                                    <Link to={`/service/${service._id}`}>
                                      <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                                    </Link>
                                    <div></div>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile View */}
                      <div className="block md:hidden">
                        {data?.services?.map((service: any, index: number) => (
                          <div
                            key={index}
                            className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  Provider Name:
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {service?.user?.name || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  Email:
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {service?.user?.email || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  Rating:
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {service?.user?.reviewStats?.totalRating ||
                                    'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  Fixed Price:
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {service?.fixedPrice || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  Category:
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {service?.category || 'N/A'}
                                </span>
                              </div>
                              {service?.category &&
                                categoryMap[service.category]?.imageUrl && (
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                      Cat. Image:
                                    </span>
                                    <img
                                      src={
                                        categoryMap[service.category].imageUrl
                                      }
                                      alt={service.category}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  </div>
                                )}
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                  Actions:
                                </span>
                                <div className="flex gap-2">
                                  <Link to={`/service/${service?._id}`}>
                                    <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
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
                        Page {page} of {data.totalPages}, Total services:{' '}
                        {data.totalServices || 0}
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

export default Services;
