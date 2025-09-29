"use client";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import useSWR from "swr";
import { API_URL, fetcherWithCredentials, FILE_URL } from "../../constants";
import Loader from "../../components/common/Loader";
import Alert from "../../components/Alert";
import { FaLocationPin } from "react-icons/fa6";
import {
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaStar,
  FaUser,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";

const SingleService = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useSWR(
    `${API_URL}/service/${id}`,
    fetcherWithCredentials
  );

  const [serviceData, setServiceData] = useState({
    category: "",
    fixedPrice: "",
    images: [] as string[],
    availability: [] as {
      day: string;
      date: string;
      opening: string;
      closing: string;
    }[],
    totalRating: 0,
    ratings: [] as any[],
    createdAt: "",
    updatedAt: "",
    user: {
      name: "",
      email: "",
      profilePicture: "",
      location: {
        type: "",
        coordinates: [0, 0],
      },
      reviewStats: {
        totalReviews: 0,
        totalRating: 0,
      },
      _id: "",
    },
  });

  useEffect(() => {
    if (data?.service) {
      setServiceData({
        category: data.service.category || "",
        fixedPrice: data.service.fixedPrice || "",
        images: data.service.images || [],
        availability: data.service.availability || [],
        totalRating: data.service.totalRating || 0,
        ratings: data.service.ratings || [],
        createdAt: data.service.createdAt || "",
        updatedAt: data.service.updatedAt || "",
        user: data.service.user || {
          name: "",
          email: "",
          profilePicture: "",
          location: {
            type: "",
            coordinates: [0, 0],
          },
          reviewStats: {
            totalReviews: 0,
            totalRating: 0,
          },
          _id: "",
        },
      });
    }
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    return dateString ? moment(dateString).format("MMMM D, YYYY") : "N/A";
  };

  // Function to format time
  const formatTime = (timeString: string) => {
    return timeString ? moment(timeString).format("h:mm A") : "N/A";
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb
          pageName={`Service Details - ${serviceData?.category || "N/A"}`}
        />
        {error || data?.error ? (
          <Alert
            title="Something went wrong"
            message="There was an error while fetching the service details"
          />
        ) : (
          <>
            {(!error || !data?.error) && (
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-5 xl:col-span-3">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Service Information
                      </h3>
                    </div>
                    <div className="p-7">
                      {/* Service Images */}
                      {serviceData.images && serviceData.images.length > 0 && (
                        <div className="mb-6 flex flex-wrap gap-3">
                          {serviceData.images.map((image, index) => (
                            <div
                              key={index}
                              className="h-40 w-40 overflow-hidden rounded-md"
                            >
                              {image ? (
                                <img
                                  src={`${FILE_URL}/service/${image}`}
                                  alt={`Service ${index + 1}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/images/noImageFound.png";
                                  }}
                                />
                              ) : (
                                <div className="h-40 w-40 rounded-full bg-gray-200" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Service Category */}
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="category"
                        >
                          Category
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <FaUser className="text-xl" />
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="category"
                            id="category"
                            disabled
                            value={serviceData.category}
                          />
                        </div>
                      </div>

                      {/* Service Price */}
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="price"
                        >
                          Fixed Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <FaDollarSign className="text-xl" />
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="price"
                            id="price"
                            disabled
                            value={`$${serviceData.fixedPrice}`}
                          />
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="mb-5.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                          Availability
                        </label>
                        {serviceData.availability &&
                        serviceData.availability.length > 0 ? (
                          <div className="rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="grid grid-cols-2 gap-4">
                              {serviceData.availability.map((slot, index) => (
                                <div
                                  key={index}
                                  className="rounded bg-white p-3 shadow-sm dark:bg-boxdark"
                                >
                                  <div className="flex items-center gap-2">
                                    <FaCalendarAlt className="text-[#40A579]" />
                                    <span className="font-medium">
                                      {slot.day}
                                    </span>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex  gap-2">
                                    <div className="flex items-center gap-2">
                                      <FaClock className="text-[#40A579]" />
                                      <span>{formatTime(slot.opening)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <FaClock className="text-[#40A579]" />
                                      <span>{formatTime(slot.closing)}</span>
                                    </div>
                                  </div>
                                  <div className="mt-1">
                                    <span className="text-xs">
                                      {formatDate(slot.date)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            No availability information
                          </p>
                        )}
                      </div>

                      {/* Creation and Update Info */}
                      <div className="mb-5.5 grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="createdAt"
                          >
                            Created At
                          </label>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="createdAt"
                            id="createdAt"
                            disabled
                            value={formatDate(serviceData.createdAt)}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="updatedAt"
                          >
                            Updated At
                          </label>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="updatedAt"
                            id="updatedAt"
                            disabled
                            value={formatDate(serviceData.updatedAt)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-5 xl:col-span-2">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Service Provider
                      </h3>
                    </div>
                    <div className="p-7">
                      <div className="mb-4 flex flex-col gap-1">
                        <div className="self-center rounded-full">
                          {serviceData.user?.profilePicture && (
                            <img
                              src={`${FILE_URL}/profile/${serviceData.user.profilePicture}`}
                              width={50}
                              height={50}
                              style={{
                                objectFit: "cover",
                                marginBottom: "20px",
                                borderRadius: "50%",
                                width: "50px",
                                height: "50px",
                              }}
                              alt="Service Provider"
                              onError={(e) => {
                                e.currentTarget.src = "/images/placeholder.png";
                              }}
                            />
                          )}
                        </div>
                        <h2
                          className="text-center text-black dark:text-white"
                          style={{ fontSize: "1.5rem" }}
                        >
                          {serviceData.user?.name}
                        </h2>

                        <div className="mt-4">
                          <div className="mb-4 rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaLocationPin className="text-[#40A579]" />
                              <span className="font-medium">Location</span>
                            </div>
                            {serviceData.user?.location?.coordinates && (
                              <div className="text-sm">
                                <p>
                                  Coordinates:{" "}
                                  {serviceData.user.location.coordinates[1]},{" "}
                                  {serviceData.user.location.coordinates[0]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="mb-4 rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaStar className="text-yellow-500" />
                              <span className="font-medium">Reviews</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-2xl font-bold">
                                  {serviceData.user?.reviewStats?.totalRating ||
                                    0}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Average Rating
                                </p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold">
                                  {serviceData.user?.reviewStats
                                    ?.totalReviews || 0}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Total Reviews
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/user/${serviceData.user?._id}`}
                          className="mt-2"
                        >
                          <div className="mb-4 rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaUser className="text-[#40A579]" />
                              <span className="font-medium">Contact</span>
                            </div>
                            <div className="text-sm">
                              <p className="mb-1">
                                Email: {serviceData.user?.email}
                              </p>
                              <p>ID: {serviceData.user?._id}</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Service Details
                      </h3>
                    </div>
                    <div className="p-7">
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Service ID:
                          </span>
                          <span className="text-sm">{id}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Category:</span>
                          <span className="text-sm">
                            {serviceData.category}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Price:</span>
                          <span className="text-sm">
                            ${serviceData.fixedPrice}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Rating:</span>
                          <span className="text-sm">
                            {serviceData.totalRating} / 5
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Created:</span>
                          <span className="text-sm">
                            {formatDate(serviceData.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Updated:</span>
                          <span className="text-sm">
                            {formatDate(serviceData.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default SingleService;
