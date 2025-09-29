import DefaultLayout from '../../components/Layouts/DefaultLayout';
import useSWR from 'swr';
import { API_URL, fetcherWithCredentials } from '../../constants';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SingleRecipe = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useSWR(
    `${API_URL}/get-recipe/${id}`,
    fetcherWithCredentials
  );
  const [recipeDetails, setRecipeDetails] = useState({
    title: '',
    recipeDetails: '',
    cuisine: '',
    ingredients: [],
    nutrition: '',
    servings: 0,
    recipeTime: '',
    user: { name: '', profilePicture: '' },
    photos: [],
  });

  useEffect(() => {
    if (data) {
      setRecipeDetails({
        title: data?.data?.title,
        recipeDetails: data?.data?.recipeDetails,
        cuisine: data?.data?.cuisine,
        ingredients: data?.data?.ingredients,
        nutrition: data?.data?.nutrition,
        servings: data?.data?.servings,
        recipeTime: data?.data?.recipeTime,
        user: data?.data?.user,
        photos: data?.data?.photos,
      });
    }
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <div className="mx-auto h-screen max-w-270">
        {(error || data?.error) && (
          <Alert
            title="Something went wrong"
            message="There was an error while fetching the recipe details."
          />
        )}
        {!error && !data?.error && (
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-5 xl:col-span-3">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Recipe Information
                  </h3>
                </div>
                <div className="p-7">
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Title
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={recipeDetails?.title}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Recipe Details
                    </label>
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      rows={4}
                      disabled
                      value={recipeDetails?.recipeDetails}
                    ></textarea>
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Cuisine
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={recipeDetails?.cuisine}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Ingredients
                    </label>
                    <ul className="ml-6 list-disc text-black dark:text-white">
                      {recipeDetails.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Nutrition
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={recipeDetails?.nutrition}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Servings
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="number"
                      disabled
                      value={recipeDetails?.servings}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Preparation Time
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={recipeDetails?.recipeTime}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-5 xl:col-span-2">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex justify-between border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Host Information
                  </h3>
                </div>
                <div className="p-7">
                  <div className="flex flex-col items-center gap-3">
                    {recipeDetails?.user?.profilePicture && (
                      <img
                        src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${recipeDetails?.user?.profilePicture}`}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', marginBottom: '20px' }}
                        alt={recipeDetails?.user?.name}
                      />
                    )}
                    <p className="text-black dark:text-white">
                      {recipeDetails?.user?.name}
                    </p>
                  </div>
                </div>
              </div>
              {recipeDetails?.photos.length > 0 && (
                <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                      Recipe Photos
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-4 p-7">
                    {recipeDetails?.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        width={200}
                        height={200}
                        style={{
                          objectFit: 'cover',
                          borderRadius: 10,
                        }}
                        alt={`Recipe photo ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default SingleRecipe;
