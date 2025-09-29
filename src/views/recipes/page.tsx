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

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectIdd, setSelectIdd] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

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
    `${API_URL}/get-recipes?${query.toString()}`,
    fetcherWithCredentials
  );

  const onConfirmDelete = async () => {
    try {
      toast.loading('Deleting recipe...');
      setLoading(true);
      await fetch(`${API_URL}/recipe/${selectIdd}`, {
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
            toast.success('Recipe deleted successfully');
            setLoading(false);
            // Refetch data
            mutate(`${API_URL}/get-recipes?${query.toString()}`);
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
          <Alert title="Something went wrong" message={data?.message} />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {/* Search Input */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    placeholder="Search for recipes"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579]"
                  />
                  <span className="absolute right-4 top-4">
                    <CiSearch className="text-xl text-[#40A579]" />
                  </span>
                </div>
              </div>

              {/* Recipes Data */}
              <div className="w-full">
                {data && data.data && data.data.length > 0 ? (
                  <>
                    {/* Mobile View */}
                    <div className="block md:hidden">
                      {data.data.map((recipe: any, index: number) => (
                        <div
                          key={index}
                          className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                        >
                          <div className="mb-2">
                            <span className="font-semibold">Id:</span>{' '}
                            {recipe._id}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">User:</span>
                            {recipe?.user?.profilePicture ? (
                              <img
                                src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${recipe.user.profilePicture}`}
                                alt="profile picture"
                                width={30}
                                height={30}
                                className="rounded-full"
                              />
                            ) : (
                              <Link to={`/user/${recipe?.user?._id || 'none'}`}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
                                  {recipe?.user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || 'N/A'}
                                </div>
                              </Link>
                            )}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Title:</span>{' '}
                            {recipe.title}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Details:</span>{' '}
                            {recipe.recipeDetails}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Servings:</span>{' '}
                            {recipe.servings || 'N/A'}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Ingredients:</span>{' '}
                            {recipe.ingredients.slice(0, 3).join(', ')}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Recipe Time:</span>{' '}
                            {recipe.recipeTime}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Nutrition:</span>{' '}
                            {recipe.nutrition}
                          </div>
                          <div className="mb-2">
                            <span className="font-semibold">Date:</span>{' '}
                            {moment(recipe.date).format('DD/MM/YYYY')}
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/recipe/${recipe._id}`}>
                              <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                            </Link>
                            <div
                              onClick={() => {
                                setSelectIdd(recipe._id);
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
                      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Id
                            </th>
                            <th scope="col" className="px-6 py-3">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Title
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Details
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Servings
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Ingredients
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Recipe Time
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Nutrition
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.data.map((recipe: any, index: number) => (
                            <tr
                              className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                              key={index}
                            >
                              <td className="px-6 py-4">{recipe._id}</td>
                              <td className="px-6 py-4">
                                {recipe?.user?.profilePicture ? (
                                  <img
                                    src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${recipe.user.profilePicture}`}
                                    alt="profile picture"
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <Link
                                    to={`/user/${recipe?.user?._id || 'none'}`}
                                  >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
                                      {recipe?.user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || 'N/A'}
                                    </div>
                                  </Link>
                                )}
                              </td>
                              <td className="px-6 py-4">{recipe.title}</td>
                              <td className="px-6 py-4">
                                {recipe.recipeDetails.length > 50
                                  ? recipe.recipeDetails.slice(0, 50) + '...'
                                  : recipe.recipeDetails}
                              </td>
                              <td className="px-6 py-4">
                                {recipe.servings || 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                {recipe.ingredients.slice(0, 3).join(', ')}
                              </td>
                              <td className="px-6 py-4">{recipe.recipeTime}</td>
                              <td className="px-6 py-4">{recipe.nutrition}</td>
                              <td className="px-6 py-4">
                                {moment(recipe.date).format('DD/MM/YYYY')}
                              </td>
                              <td className="flex cursor-pointer gap-2 px-6 py-4">
                                <Link to={`/recipe/${recipe._id}`}>
                                  <PiEyeLight className="cursor-pointer text-2xl text-[#40A579]" />
                                </Link>
                                <div
                                  onClick={() => {
                                    setSelectIdd(recipe._id);
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
                  <div>No recipes found.</div>
                )}
              </div>

              {/* Pagination Controls */}
              {data && (
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Page {page} of {data.totalPages}, Total recipes:{' '}
                      {data.totalRecipes}
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
                type="recipe"
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Recipes;
