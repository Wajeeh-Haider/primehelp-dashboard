import { useState, useEffect } from 'react';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import {
  API_URL,
  fetcherWithCredentials,
  PRIMARY_COLOR,
} from '../../constants';
import useSWR, { mutate } from 'swr';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { MdEdit } from 'react-icons/md';
import { CiSearch, CiCircleCheck } from 'react-icons/ci';
import { RxCrossCircled } from 'react-icons/rx';
import { Link } from 'react-router-dom';
import { PiTrash } from 'react-icons/pi';
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

const Admins = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'asc',
  });
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectIdd, setSelectIdd] = useState('');
  const [page, setPage] = useState(1);
  const [confirmationRemoveModal, setConfirmationRemoveModal] = useState(false);
  const [removeAdminId, setRemoveAdminId] = useState('');
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
    `${API_URL}/all/?${query.toString()}`,
    fetcherWithCredentials,
  );

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const onConfirmDelete = async () => {
    try {
      toast.loading('Deleting user...');
      setLoading(true);
      await fetch(`${API_URL}/users/${selectIdd}`, {
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
            toast.success('User deleted successfully');
            setLoading(false);
            // Refetch data
            mutate(`${API_URL}/all/?${query.toString()}`);
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

  const manageAdmin = async (user: any) => {
    if (user.role === 'admin') {
      setConfirmationRemoveModal(true);
      setRemoveAdminId(user._id);
    } else {
      await makeAdmin(user._id);
    }
  };

  const removeAdmin = async () => {
    try {
      toast.loading('Removing admin...');
      await fetch(`${API_URL}/manage/${removeAdminId}`, {
        method: 'PATCH',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(res => {
          if (!res.error) {
            setConfirmationRemoveModal(false);
            toast.dismiss();
            toast.success('Admin removed successfully');
            // Refetch data
            mutate(`${API_URL}/all/?${query.toString()}`);
          } else {
            toast.dismiss();
            toast.error('Something went wrong');
          }
        })
        .catch(() => {
          toast.dismiss();
          toast.error('Something went wrong');
        });
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    }
  };
  const makeAdmin = async (selectIdd: string) => {
    try {
      toast.loading('Creating admin...');
      await fetch(`${API_URL}/manage/${selectIdd}`, {
        method: 'PATCH',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(res => {
          if (!res.error) {
            setConfirmationRemoveModal(false);
            toast.dismiss();
            toast.success('Admin created successfully');
            // Refetch data
            mutate(`${API_URL}/all/?${query.toString()}`);
          } else {
            toast.dismiss();
            toast.error('Something went wrong');
          }
        })
        .catch(() => {
          toast.dismiss();
          toast.error('Something went wrong');
        });
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    }
  };

  // if (isLoading) return <Loader opacity={true} />;

  return (
    <DefaultLayout>
      {isLoading ? (
        <Loader opacity={true} />
      ) : (
        <div className="h-screen">
          {(data?.error || error) && (
            <Alert title="Something went wrong" message={data?.message} />
          )}
          <div className="flex flex-col gap-3">
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  placeholder="Search for users to make admin"
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
              {data && data.data && data.data.length > 0 ? (
                <>
                  {/* Mobile View */}
                  <div className="block md:hidden">
                    {data.data.map((user: any, index: number) => (
                      <div
                        key={index}
                        className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="mb-2">
                          <span className="font-semibold">Id:</span> {user._id}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Name:</span>{' '}
                          {user.name}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Email:</span>{' '}
                          {user.email}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Location:</span>{' '}
                          {user?.location?.description}
                        </div>
                        {/* Phone Number removed */}
                        <div className="mb-2">
                          <span className="font-semibold">Email Verified:</span>{' '}
                          {user.isEmailVerified ? (
                            <CiCircleCheck className="inline text-2xl text-green-500" />
                          ) : (
                            <RxCrossCircled className="inline text-2xl text-red-500" />
                          )}
                        </div>
                        {/* Phone Verified removed */}
                        <div className="mb-2">
                          <span className="font-semibold">Subscription:</span>{' '}
                          {user.subscription ? user.subscription : 'Free'}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Verified:</span>{' '}
                          {user.isProfileVerified ? (
                            <CiCircleCheck className="inline text-2xl text-green-500" />
                          ) : (
                            <RxCrossCircled className="inline text-2xl text-red-500" />
                          )}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Admin:</span>{' '}
                          {user.role === 'admin' ? (
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded-md"
                              onClick={() => manageAdmin(user)}
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              className="bg-[#40A579] text-white px-2 py-1 rounded-md"
                              onClick={() => manageAdmin(user)}
                            >
                              Make Admin
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/user/${user._id}`}>
                            <MdEdit
                              className={`cursor-pointer text-2xl text-[${PRIMARY_COLOR}]`}
                            />
                          </Link>
                          <div
                            onClick={() => {
                              setDeleteModal(true);
                              setSelectIdd(user._id);
                            }}
                          >
                            <PiTrash className="cursor-pointer text-2xl text-red-500" />
                          </div>
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
                            onClick={() => handleSort('_id')}
                          >
                            Id
                          </th>
                          <th
                            scope="col"
                            className="cursor-pointer px-3 py-2"
                            onClick={() => handleSort('name')}
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="cursor-pointer px-3 py-2"
                            onClick={() => handleSort('email')}
                          >
                            Email
                          </th>
                          <th scope="col" className="px-3 py-2">
                            Location
                          </th>
                          {/* Phone Number column removed */}
                          <th
                            scope="col"
                            className="cursor-pointer px-3 py-2"
                            onClick={() => handleSort('isEmailVerified')}
                          >
                            Email Verified
                          </th>
                          {/** Phone Verified column removed */}
                          <th
                            scope="col"
                            className="cursor-pointer px-3 py-2"
                            onClick={() => handleSort('subscription')}
                          >
                            Subscription
                          </th>
                          <th
                            scope="col"
                            className="cursor-pointer px-3 py-2"
                            onClick={() => handleSort('isProfileVerified')}
                          >
                            Verified
                          </th>
                          <th scope="col" className="px-3 py-2">
                            Admin
                          </th>

                          <th scope="col" className="px-3 py-2">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.data.map((user: any, index: number) => (
                          <tr
                            className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                            key={index}
                          >
                            <td className="px-3 py-2">{user._id}</td>
                            <td className="px-3 py-2">{user.name}</td>
                            <td className="px-3 py-2">{user.email}</td>
                            <td className="px-3 py-2">
                              {user?.location?.description}
                            </td>
                            {/** Phone Number cell removed */}
                            <td className="px-3 py-2">
                              {user.isEmailVerified ? (
                                <CiCircleCheck className="text-2xl text-green-500" />
                              ) : (
                                <RxCrossCircled className="text-2xl text-red-500" />
                              )}
                            </td>
                            {/** Phone Verified cell removed */}
                            <td className="px-3 py-2">
                              {user.subscription ? user.subscription : 'Free'}
                            </td>
                            <td className="px-3 py-2">
                              {user.isProfileVerified ? (
                                <CiCircleCheck className="text-2xl text-green-500" />
                              ) : (
                                <RxCrossCircled className="text-2xl text-red-500" />
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {user.role === 'admin' ? (
                                <button
                                  className="bg-red-500 text-white px-2 py-1 rounded-md"
                                  onClick={() => manageAdmin(user)}
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  className="bg-[#40A579] text-white px-2 py-1 rounded-md"
                                  onClick={() => manageAdmin(user)}
                                >
                                  Make Admin
                                </button>
                              )}
                            </td>
                            <td className="flex gap-2 px-3 py-2">
                              <Link to={`/user/${user._id}`}>
                                <MdEdit
                                  className={`cursor-pointer text-2xl text-[${PRIMARY_COLOR}]`}
                                />
                              </Link>
                              <div
                                onClick={() => {
                                  setDeleteModal(true);
                                  setSelectIdd(user._id);
                                }}
                              >
                                <PiTrash className="cursor-pointer text-2xl text-red-500" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div>No users found.</div>
              )}
            </div>

            {/* Pagination Controls */}
            {data && (
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Page {data.totalPages === 0 ? 0 : page} of {data.totalPages}
                    , Total users: {data.totalUsers}
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
              type="user"
              loading={loading}
            />
          )}

          {/* Remove Admin Confirmation Modal */}
          {confirmationRemoveModal && (
            <DeleteModal
              onCancel={() => setConfirmationRemoveModal(false)}
              onConfirm={removeAdmin}
              type="admin"
              loading={loading}
            />
          )}

          {/* Set Admin Permission Modal */}
        </div>
      )}
    </DefaultLayout>
  );
};

export default Admins;
