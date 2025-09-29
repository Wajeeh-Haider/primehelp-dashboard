import { useState, useEffect } from 'react';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import { API_URL, fetcherWithCredentials } from '../../constants';
import useSWR, { mutate } from 'swr';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { CiSearch } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { PiEyeLight, PiTrash } from 'react-icons/pi';
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

const Meals = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
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
    `${API_URL}/get-meals-all?${query.toString()}`,
    fetcherWithCredentials
  );

  const onConfirmDelete = async () => {
    try {
      toast.loading('Deleting meal...');
      setLoading(true);
      await fetch(`${API_URL}/meal/${selectIdd}`, {
        method: 'DELETE',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((res) => {
          if (!res.error) {
            setDeleteModal(false);
            toast.dismiss();
            toast.success('Meal deleted successfully');
            setLoading(false);
            // Refetch data
            mutate(`${API_URL}/get-meals-all?${query.toString()}`);
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

  if (isLoading) return <Loader opacity={true} />;

  return (
    <DefaultLayout>
      <div className="h-screen">
        {data?.error || error ? (
          <Alert
            title="Something went wrong"
            message={data?.message || 'An error occurred while fetching data.'}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    placeholder="Search for meals"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579]"
                  />
                  <span className="absolute right-4 top-4">
                    <CiSearch className="text-xl text-[#40A579]" />
                  </span>
                </div>
              </div>

              {/* Meals Data */}
              <div className="w-full">
                {data && data.data && data.data.length > 0 ? (
                  <>
                    {/* Mobile View */}
                    <div className="block md:hidden">
                      {data.data.map((meal: any, index: number) => (
                        <div
                          key={index}
                          className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="mb-2">
                            <span className="font-semibold">Id:</span>{' '}
                            {meal._id}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">User:</span>
                            {meal.user.profilePicture ? (
                              <img
                                src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${meal.user.profilePicture}`}
                                alt="profile picture"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                }}
                                className="rounded-full"
                              />
                            ) : (
                              <Link
                                to={`/user/${meal.user._id || 'none'}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white"
                              >
                                {meal.user.name.charAt(0).toUpperCase()}
                              </Link>
                            )}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Title:</span>{' '}
                            {meal.title}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Description:</span>{' '}
                            {meal.description}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Location:</span>{' '}
                            {meal.location?.description || 'N/A'}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">
                              Contributions:
                            </span>{' '}
                            {meal.contribution?.toString()}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">
                              Spots Available:
                            </span>{' '}
                            {meal.spotAvailable?.toString()}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">
                              Remaining Spots:
                            </span>{' '}
                            {meal.spotAvailable - (meal.remainingSpots || 0)}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Date:</span>{' '}
                            {moment(meal.date).format('DD/MM/YYYY')}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Time:</span>{' '}
                            {moment(meal.time).format('hh:mm A')}
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/meal/${meal._id}`}>
                              <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                            </Link>
                            <div
                              onClick={() => {
                                setSelectIdd(meal._id);
                                setDeleteModal(true);
                              }}
                            >
                              <PiTrash className="cursor-pointer text-2xl text-red-900" />
                            </div>
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
                              Id
                            </th>
                            <th scope="col" className="px-4 py-2">
                              User
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Title
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Description
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Location
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Contributions
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Spots Available
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Remaining Spots
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Date
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Time
                            </th>
                            <th scope="col" className="px-4 py-2">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.data.map((meal: any, index: number) => (
                            <tr
                              className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                              key={index}
                            >
                              <td className="px-4 py-2">{meal._id}</td>
                              <td className="px-4 py-2">
                                {meal.user.profilePicture ? (
                                  <img
                                    src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${meal.user.profilePicture}`}
                                    alt="profile picture"
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '50%',
                                    }}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <Link
                                    to={`/user/${meal.user._id || 'none'}`}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white"
                                  >
                                    {meal.user.name.charAt(0).toUpperCase()}
                                  </Link>
                                )}
                              </td>
                              <td className="px-4 py-2">{meal.title}</td>
                              <td className="px-4 py-2">
                                {meal?.description?.slice(0, 50) || 'N/A'}
                              </td>
                              <td className="px-4 py-2">
                                {meal?.location?.description || 'N/A'}
                              </td>
                              <td className="px-4 py-2">
                                {meal?.contribution?.toString()}
                              </td>
                              <td className="px-4 py-2">
                                {meal?.spotAvailable?.toString()}
                              </td>
                              <td className="px-4 py-2">
                                {meal?.spotAvailable -
                                  (meal?.remainingSpots || 0)}
                              </td>
                              <td className="px-4 py-2">
                                {moment(meal?.date).format('DD/MM/YYYY')}
                              </td>
                              <td className="px-4 py-2">
                                {moment(meal?.time).format('hh:mm A')}
                              </td>
                              <td className="flex cursor-pointer gap-2">
                                <Link to={`/meal/${meal._id}`}>
                                  <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                                </Link>
                                <div
                                  onClick={() => {
                                    setSelectIdd(meal._id);
                                    setDeleteModal(true);
                                  }}
                                >
                                  <PiTrash className="cursor-pointer text-2xl text-red-900" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div>No meals found.</div>
                )}
              </div>

              {/* Pagination Controls */}
              {data && (
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Page {page} of {data.totalPages}, Total meals:{' '}
                      {data.totalMeals}
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
                type="meal"
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Meals;
