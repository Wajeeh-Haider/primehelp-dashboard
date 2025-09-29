import DefaultLayout from "../../components/Layouts/DefaultLayout";
import useSWR, { mutate } from "swr";
import { API_URL, fetcherWithCredentials } from "../../constants";
import Loader from "../../components/common/Loader";
import Alert from "../../components/Alert";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdTrash } from "react-icons/io";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const SingleMeal = () => {
  const router = useNavigate();
  const { id } = useParams();

  const { data, isLoading, error } = useSWR(
    `${API_URL}/get-meal/${id}`,
    fetcherWithCredentials
  );
  const [mealDetails, setMealDetails] = useState({
    title: "",
    description: "",
    cuisine: "",
    date: "",
    location: { description: "", city: "", state: "" },
    time: "",
    spotAvailable: 0,
    spotOccupied: 0,
    user: { _id: "", name: "", profilePicture: "" },
    photos: [],
    participants: [
      {
        name: "",
        profilePicture: "",
      },
    ],
  });

  useEffect(() => {
    if (data) {
      setMealDetails({
        title: data?.data?.title,
        description: data?.data?.description,
        cuisine: data?.data?.cuisine,
        date: new Date(data?.data?.date).toLocaleDateString(),
        location: data?.data?.location,
        time: new Date(data?.data?.time).toLocaleTimeString(),
        spotAvailable: data?.data?.spotAvailable,
        spotOccupied: data?.data?.spotOccupied,
        user: {
          _id: data?.data?.user._id,
          name: data?.data?.user.name,
          profilePicture: data?.data?.user.profilePicture,
        },
        photos: data?.data?.photos,
        participants: data?.data?.participants,
      });
    }
  }, [data]);

  const deleteMealImage = (image: string) => {
    toast.loading("Deleting image");
    fetch(`${API_URL}/meal-image/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "auth-token": `${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        image,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        toast.dismiss();
        toast.success("Image deleted successfully");
        mutate(`${API_URL}/get-meal/${id}`);
        router(`/meals/${id}`);
      })
      .catch((error) => {
        console.error(error);
        toast.dismiss();
        toast.error("An error occurred while deleting the image");
      });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <div className="mx-auto h-screen max-w-270">
        {(error || data?.error) && (
          <Alert
            title="Something went wrong"
            message="There was an error while fetching the meal details."
          />
        )}
        {!error && !data?.error && (
          <div className="grid grid-cols-5 gap-8">
            <div className="lg:col-span-3 px-4">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-bold text-black dark:text-white text-2lg">
                    Meal Information
                  </h3>
                </div>
                <div className="p-7">
                  <div className="mb-5.5">
                    <label className="block text-2lg font-medium text-black dark:text-white">
                      Title
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={mealDetails?.title}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      rows={4}
                      disabled
                      value={mealDetails?.description}
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
                      value={mealDetails?.cuisine}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Date
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={mealDetails?.date}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Time
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={mealDetails?.time}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Location
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={`${mealDetails?.location.city}, ${mealDetails?.location.state}`}
                    />
                  </div>
                  <div className="mb-5.5">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Spots Available
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray px-4 py-3 text-black focus:border-[#40A579] dark:border-strokedark dark:bg-meta-4 dark:text-white"
                      type="text"
                      disabled
                      value={`${
                        mealDetails?.spotAvailable - mealDetails?.spotOccupied
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className=" lg:col-span-2 px-2">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex justify-between border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Host Information
                  </h3>
                </div>
                <Link to={`/user/${mealDetails?.user?._id}`}>
                  <div className="p-7">
                    <div className="flex flex-col items-center gap-3">
                      {mealDetails?.user.profilePicture && (
                        <img
                          src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${mealDetails?.user.profilePicture}`}
                          width={100}
                          height={100}
                          style={{ objectFit: "cover", marginBottom: "20px" }}
                          alt={mealDetails?.user.name}
                        />
                      )}
                      <p className="text-black dark:text-white">
                        {mealDetails?.user.name}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              {mealDetails?.photos.length > 0 && (
                <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                      Meal Photos
                    </h3>
                  </div>
                  <div className="relative flex flex-wrap gap-4 p-7">
                    {mealDetails?.photos.map((photo, index) => (
                      <div className="relative w-1/2 sm:w-1/4" key={index}>
                        <IoMdTrash
                          className="absolute right-2 top-2 z-10 cursor-pointer text-red-500"
                          onClick={() => deleteMealImage(photo)}
                          size={24}
                        />
                        <img
                          src={photo}
                          width={40}
                          height={40}
                          sizes="100vw"
                          style={{
                            objectFit: "cover",
                            borderRadius: 10,
                            width: "100%",
                            height: "100%",
                          }}
                          alt={`Meal photo ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mealDetails?.participants.length > 0 && (
                <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">
                      Meal Participants
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-4 p-7">
                    {mealDetails?.participants.map((user, index) => (
                      <div key={index} className="flex flex-col gap-3">
                        <img
                          src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${user?.profilePicture}`}
                          width={40}
                          height={40}
                          sizes="100vw"
                          style={{
                            objectFit: "cover",
                            borderRadius: 10,
                            width: "30%",
                          }}
                          alt={`Meal photo ${index + 1}`}
                        />
                        <h2 className="text-black dark:text-white">
                          {user?.name}
                        </h2>
                      </div>
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

export default SingleMeal;
