import { useState, useEffect } from 'react';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import {
  API_URL,
  fetcherWithCredentials,
  PRIMARY_COLOR,
} from '../../constants';
import useSWR from 'swr';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { MdEdit } from 'react-icons/md';
import { CiSearch, CiCircleCheck } from 'react-icons/ci';
import { RxCrossCircled } from 'react-icons/rx';
import { Link } from 'react-router-dom';
import { BsEye } from 'react-icons/bs';

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

const Payments = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'asc',
  });

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

  if (sortConfig.key) {
    query.append('sortKey', sortConfig.key);
    query.append('sortDirection', sortConfig.direction);
  }

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    `${API_URL}/payments?${query.toString()}`,
    fetcherWithCredentials,
  );

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
                data?.message ||
                'An error occurred while fetching data. Please try again later.'
              }
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      placeholder="Search for payments"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579] sm:py-4 sm:pl-6 sm:pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 transform sm:right-4">
                      <CiSearch className="text-xl text-[#40A579]" />
                    </span>
                  </div>
                </div>

                {/* User Data */}
                <div className="w-full">
                  {data && data?.data && data?.data.length > 0 ? (
                    <>
                      {/* Mobile View */}
                      <div className="block md:hidden">
                        {data?.data.map((payment: any, index: number) => (
                          <div
                            key={index}
                            className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="mb-2">
                              {/* <span className="font-semibold">Id:</span>{" "}
                            {payment._id} */}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Name:</span>{' '}
                              {payment?.name}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Email:</span>{' '}
                              {payment?.email}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Location:</span>{' '}
                              {payment?.locationDescription}
                            </div>
                            {/* Phone Number removed */}
                            <div className="mb-2">
                              <span className="font-semibold">
                                Email Verified:
                              </span>{' '}
                              {payment?.isEmailVerified ? (
                                <CiCircleCheck className="inline text-2xl text-green-500" />
                              ) : (
                                <RxCrossCircled className="inline text-2xl text-red-500" />
                              )}
                            </div>
                            {/* Phone Verified removed */}

                            <div className="flex gap-2">
                              <Link to={`/payment/${payment._id}`}>
                                <MdEdit
                                  className={`cursor-pointer text-2xl text-[${PRIMARY_COLOR}]`}
                                />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop View */}
                      <div className="hidden overflow-x-auto scrollbar-hide md:block">
                        <table className="min-w-full table-auto text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th
                                scope="col"
                                className="cursor-pointer px-3 py-2"
                                onClick={() => handleSort('name')}
                              >
                                Booking Id
                              </th>
                              <th
                                scope="col"
                                className="cursor-pointer px-3 py-2"
                                onClick={() => handleSort('email')}
                              >
                                Serivce Seeker
                              </th>
                              <th scope="col" className="px-3 py-2">
                                Service Provider
                              </th>
                              <th scope="col" className="px-3 py-2">
                                Service Category
                              </th>

                              <th
                                scope="col"
                                className="cursor-pointer px-3 py-2"
                                onClick={() => handleSort('isEmailVerified')}
                              >
                                Booking Price
                              </th>
                              <th
                                scope="col"
                                className="cursor-pointer px-3 py-2"
                                onClick={() => handleSort('isPhoneVerified')}
                              >
                                Payment Made
                              </th>

                              <th scope="col" className="px-3 py-2">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.data.map((payment: any, index: number) => (
                              <tr
                                className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                key={index}
                              >
                                {/* <td className="px-3 py-2">{payment._id}</td> */}
                                <td className="px-3 py-2">
                                  {payment?.bookingId?._id}
                                </td>
                                <td className="px-3 py-2">
                                  <Link
                                    to={`/user/${payment?.bookingId?.user?._id}`}
                                  >
                                    {payment?.bookingId?.user?.name}
                                  </Link>
                                </td>
                                <td className="px-3 py-2">
                                  <Link
                                    to={`/user/${payment?.bookingId?.serviceProvider?._id}`}
                                  >
                                    {payment?.bookingId?.serviceProvider?.name}
                                  </Link>
                                </td>
                                <td className="px-3 py-2">
                                  {payment?.bookingId?.service?.category ||
                                    'N/A'}
                                </td>
                                <td className="px-3 py-2">
                                  {payment?.bookingId?.price}
                                </td>
                                <td className="px-3 py-2">
                                  {payment?.bookingId?.total}
                                </td>

                                <td className="flex gap-2 px-3 py-2">
                                  <Link to={`/payment/${payment._id}`}>
                                    <BsEye
                                      className={`cursor-pointer text-2xl text-[${PRIMARY_COLOR}]`}
                                    />
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div>No payments found.</div>
                  )}
                </div>

                {/* Pagination Controls */}
                {data && (
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Page {page} of {data.totalPages}, Total payments:{' '}
                        {data.totalUsers}
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
            </>
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default Payments;
