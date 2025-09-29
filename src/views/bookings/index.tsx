import { useState, useEffect } from 'react';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import { API_URL, fetcherWithCredentials } from '../../constants';
import useSWR from 'swr';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { CiSearch } from 'react-icons/ci';
import moment from 'moment';
import DeleteModal from '../../modal/DeleteModal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { RiSecurePaymentFill } from 'react-icons/ri';
import { BsEye } from 'react-icons/bs';

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const Bookings = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectIdd, setSelectIdd] = useState("");
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
    `${API_URL}/all-bookings?${query.toString()}`,
    fetcherWithCredentials
  );

  const onConfirmDelete = async () => {
    try {
      toast.loading('Deleting meal...');
      setLoading(true);
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
                      placeholder="Search for bookings"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579]"
                    />
                    <span className="absolute right-4 top-4">
                      <CiSearch className="text-xl text-[#40A579]" />
                    </span>
                  </div>
                </div>

                {/* Bookings Data */}
                <div className="w-full">
                  {data && data.bookings && data.bookings.length > 0 ? (
                    <>
                      {/* Mobile View */}
                      <div className="block md:hidden">
                        {data.bookings.map((booking: any, index: number) => (
                          <div
                            key={index}
                            className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="mb-2">
                              <span className="font-semibold">User:</span>{' '}
                              {booking?.user?.name} ({booking?.user?.email})
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">
                                Service Provider:
                              </span>{' '}
                              {booking?.serviceProvider?.name} (
                              {booking?.serviceProvider?.email})
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">
                                Service Category:
                              </span>{' '}
                              {booking?.service?.category || 'N/A'}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Status:</span>{' '}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Location:</span>{' '}
                              {booking?.serviceSeekerLocationDescription}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Date:</span>{' '}
                              {moment(booking?.date).format('DD/MM/YYYY')}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Price:</span>{' '}
                              {booking?.price}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">VAT:</span>{' '}
                              {booking?.vat}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Total:</span>{' '}
                              {booking?.total}
                            </div>
                            <div className="py-2 flex items-center gap-2">
                              <Link
                                to={`/payment/${booking?.paymentId}`}
                                className=" text-white px-4 py-2 rounded bg-[#40A579]"
                              >
                                <RiSecurePaymentFill />
                              </Link>
                              <Link
                                to={`/booking/${booking?._id}`}
                                className=" text-white px-4 py-2 rounded bg-[#40A579]"
                              >
                                <BsEye />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full table-auto text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th scope="col" className="px-4 py-2">
                                User
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Provider
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Category
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Location
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Date
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Price
                              </th>
                              <th scope="col" className="px-4 py-2">
                                VAT
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Total
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Status
                              </th>
                              <th scope="col" className="px-4 py-2">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.bookings.map(
                              (booking: any, index: number) => (
                                <tr
                                  className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                  key={index}
                                >
                                  <td className="px-4 py-2">
                                    {booking?.user?.name}
                                  </td>
                                  <td className="px-4 py-2">
                                    {booking?.serviceProvider?.name}
                                  </td>
                                  <td className="px-4 py-2">
                                    {booking?.service?.category ? (
                                      <Link
                                        to={`/service/${booking?.service?._id}`}
                                      ></Link>
                                    ) : (
                                      'N/A'
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    {booking?.serviceSeekerLocationDescription}
                                  </td>
                                  <td className="px-4 py-2">
                                    {moment(booking?.date).format('DD/MM/YYYY')}
                                  </td>
                                  <td className="px-4 py-2">
                                    {booking?.price}
                                  </td>
                                  <td className="px-4 py-2">{booking?.vat}</td>
                                  <td className="px-4 py-2">
                                    {booking?.total}
                                  </td>
                                  <td className="px-4 py-2">
                                    {booking?.status === 'pending' ? (
                                      <span className="text-sm text-yellow-500 bg-yellow-100 px-2 py-1 rounded-md">
                                        Pending
                                      </span>
                                    ) : booking?.status === 'completed' ? (
                                      <span className="text-sm text-green-500 bg-green-100 px-2 py-1 rounded-md">
                                        Completed
                                      </span>
                                    ) : (
                                      <span className="text-sm text-red-500 bg-red-100 px-2 py-1 rounded-md">
                                        Cancelled
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 flex items-center gap-2">
                                    <Link
                                      to={`/payment/${booking?.paymentId}`}
                                      className=" text-white px-4 py-2 rounded bg-[#40A579]"
                                    >
                                      <RiSecurePaymentFill />
                                    </Link>
                                    <Link
                                      to={`/booking/${booking?._id}`}
                                      className=" text-white px-4 py-2 rounded bg-[#40A579]"
                                    >
                                      <BsEye />
                                    </Link>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div>No bookings found.</div>
                  )}
                </div>

                {/* Pagination Controls */}
                {data && (
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Page {page} of {data.totalPages}, Total bookings:{' '}
                        {data.totalBookings}
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

export default Bookings;
