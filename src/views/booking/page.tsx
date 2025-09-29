"use client";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import useSWR from "swr";
import { API_URL, fetcherWithCredentials, FILE_URL } from "../../constants";
import Loader from "../../components/common/Loader";
import Alert from "../../components/Alert";
import {
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaStar,
  FaUser,
} from "react-icons/fa";
import { FaLocationPin } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";

const SingleBooking = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useSWR(
    `${API_URL}/booking/${id}`,
    fetcherWithCredentials
  );

  const [bookingData, setBookingData] = useState({
    _id: "",
    user: {
      _id: "",
      name: "",
      email: "",
      profilePicture: "",
      reviewStats: { totalReviews: 0, totalRating: 0 },
      location: { type: "", coordinates: [0, 0] },
    },
    serviceProvider: {
      _id: "",
      name: "",
      email: "",
      profilePicture: "",
      reviewStats: { totalReviews: 0, totalRating: 0 },
      location: { type: "", coordinates: [0, 0] },
    },
    date: "",
    startTime: "",
    endTime: "",
    status: "",
    serviceSeekerLocationDescription: "",
    price: "",
    vat: "",
    total: "",
    platformFee: "",
    description: "",
    createdAt: "",
    updatedAt: "",
    paymentId: "",
    serviceId: "",
    serviceCategory: "",
    serviceFixedPrice: "",
  });

  useEffect(() => {
    console.log(data);
    if (data?.booking) {
      // Fetch payment details to get paymentId
      fetch(`${API_URL}/payment/by-booking/${data.booking._id}`, {
        headers: {
          "auth-token": `${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((paymentData) => {
          setBookingData({
            _id: data.booking._id || "",
            user: {
              _id: data.booking.user?._id || "",
              name: data.booking.user?.name || "",
              email: data.booking.user?.email || "",
              profilePicture: data.booking.user?.profilePicture || "",
              reviewStats: data.booking.user?.reviewStats || {
                totalReviews: 0,
                totalRating: 0,
              },
              location: data.booking.user?.location || {
                type: "",
                coordinates: [0, 0],
              },
            },
            serviceProvider: {
              _id: data.booking.serviceProvider?._id || "",
              name: data.booking.serviceProvider?.name || "",
              email: data.booking.serviceProvider?.email || "",
              profilePicture:
                data.booking.serviceProvider?.profilePicture || "",
              reviewStats: data.booking.serviceProvider?.reviewStats || {
                totalReviews: 0,
                totalRating: 0,
              },
              location: data.booking.serviceProvider?.location || {
                type: "",
                coordinates: [0, 0],
              },
            },
            date: data.booking.date || "",
            startTime: data.booking.startTime || "",
            endTime: data.booking.endTime || "",
            status: data.booking.status || "",
            serviceSeekerLocationDescription:
              data.booking.serviceSeekerLocationDescription || "",
            price: data.booking.price || "",
            vat: data.booking.vat || "",
            total: data.booking.total || "",
            platformFee: data.booking.platformFee || "",
            description: data.booking.description || "",
            createdAt: data.booking.createdAt || "",
            updatedAt: data.booking.updatedAt || "",
            paymentId: paymentData?.data?._id || "",
            serviceId:
              typeof data.booking.service === "object" &&
              data.booking.service !== null
                ? data.booking.service._id
                : "",
            serviceCategory:
              typeof data.booking.service === "object" &&
              data.booking.service !== null
                ? data.booking.service.category
                : "",
            serviceFixedPrice:
              typeof data.booking.service === "object" &&
              data.booking.service !== null
                ? data.booking.service.fixedPrice
                : "",
          });
        })
        .catch(() => {
          // Set booking data without paymentId if payment fetch fails
          setBookingData({
            _id: data.booking._id || "",
            user: {
              _id: data.booking.user?._id || "",
              name: data.booking.user?.name || "",
              email: data.booking.user?.email || "",
              profilePicture: data.booking.user?.profilePicture || "",
              reviewStats: data.booking.user?.reviewStats || {
                totalReviews: 0,
                totalRating: 0,
              },
              location: data.booking.user?.location || {
                type: "",
                coordinates: [0, 0],
              },
            },
            serviceProvider: {
              _id: data.booking.serviceProvider?._id || "",
              name: data.booking.serviceProvider?.name || "",
              email: data.booking.serviceProvider?.email || "",
              profilePicture:
                data.booking.serviceProvider?.profilePicture || "",
              reviewStats: data.booking.serviceProvider?.reviewStats || {
                totalReviews: 0,
                totalRating: 0,
              },
              location: data.booking.serviceProvider?.location || {
                type: "",
                coordinates: [0, 0],
              },
            },
            date: data.booking.date || "",
            startTime: data.booking.startTime || "",
            endTime: data.booking.endTime || "",
            status: data.booking.status || "",
            serviceSeekerLocationDescription:
              data.booking.serviceSeekerLocationDescription || "",
            price: data.booking.price || "",
            vat: data.booking.vat || "",
            total: data.booking.total || "",
            platformFee: data.booking.platformFee || "",
            description: data.booking.description || "",
            createdAt: data.booking.createdAt || "",
            updatedAt: data.booking.updatedAt || "",
            paymentId: "",
            serviceId:
              typeof data.booking.service === "object" &&
              data.booking.service !== null
                ? data.booking.service._id
                : "",
            serviceCategory:
              typeof data.booking.service === "object" &&
              data.booking.service !== null
                ? data.booking.service.category
                : "",
            serviceFixedPrice:
              typeof data.booking.service === "object" &&
              data.booking.service !== null
                ? data.booking.service.fixedPrice
                : "",
          });
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
    return timeString
      ? moment(`2023-01-01 ${timeString}`).format("h:mm A")
      : "N/A";
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb
          pageName={`Booking Details - ${bookingData._id || "N/A"}`}
        />
        {error || data?.error ? (
          <Alert
            title="Something went wrong"
            message="There was an error while fetching the booking details"
          />
        ) : (
          <>
            {(!error || !data?.error) && (
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-5 xl:col-span-3">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Booking Information
                      </h3>
                    </div>
                    <div className="p-7">
                      {/* Booking Location */}
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="location"
                        >
                          Location
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <FaLocationPin className="text-xl" />
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="location"
                            id="location"
                            disabled
                            value={bookingData.serviceSeekerLocationDescription}
                          />
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="mb-5.5 grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="date"
                          >
                            Date
                          </label>
                          <div className="relative">
                            <span className="absolute left-4.5 top-4">
                              <FaCalendarAlt className="text-xl" />
                            </span>
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                              type="text"
                              name="date"
                              id="date"
                              disabled
                              value={formatDate(bookingData.date)}
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="time"
                          >
                            Time
                          </label>
                          <div className="relative">
                            <span className="absolute left-4.5 top-4">
                              <FaClock className="text-xl" />
                            </span>
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                              type="text"
                              name="time"
                              id="time"
                              disabled
                              value={`${formatTime(
                                bookingData.startTime
                              )} - ${formatTime(bookingData.endTime)}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial Details */}
                      <div className="mb-5.5 grid grid-cols-3 gap-4">
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="price"
                          >
                            Price
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
                              value={`$${bookingData.price}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="vat"
                          >
                            VAT
                          </label>
                          <div className="relative">
                            <span className="absolute left-4.5 top-4">
                              <FaDollarSign className="text-xl" />
                            </span>
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                              type="text"
                              name="vat"
                              id="vat"
                              disabled
                              value={`$${bookingData.vat}`}
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="platformFee"
                          >
                            Platform Fee
                          </label>
                          <div className="relative">
                            <span className="absolute left-4.5 top-4">
                              <FaDollarSign className="text-xl" />
                            </span>
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                              type="text"
                              name="platformFee"
                              id="platformFee"
                              disabled
                              value={`$${bookingData.platformFee}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="total"
                        >
                          Total
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <FaDollarSign className="text-xl" />
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="total"
                            id="total"
                            disabled
                            value={`$${bookingData.total}`}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="status"
                        >
                          Status
                        </label>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                          type="text"
                          name="status"
                          id="status"
                          disabled
                          value={bookingData.status}
                        />
                      </div>

                      {/* Description */}
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="description"
                        >
                          Description
                        </label>
                        <textarea
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                          name="description"
                          id="description"
                          disabled
                          value={bookingData.description}
                        />
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
                            value={formatDate(bookingData.createdAt)}
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
                            value={formatDate(bookingData.updatedAt)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Booking Summary
                      </h3>
                    </div>
                    <div className="p-7">
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Booking ID:
                          </span>
                          <span className="text-sm">{bookingData._id}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Service ID:
                          </span>

                          <a
                            href={`/service/${bookingData.serviceId}`}
                            className="text-sm"
                          >
                            {bookingData.serviceId || "N/A"}
                          </a>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Payment ID:
                          </span>
                          <span className="text-sm">
                            {bookingData.paymentId || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Status:</span>
                          <span className="text-sm capitalize">
                            {bookingData.status}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total:</span>
                          <span className="text-sm">${bookingData.total}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Created:</span>
                          <span className="text-sm">
                            {formatDate(bookingData.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Updated:</span>
                          <span className="text-sm">
                            {formatDate(bookingData.updatedAt)}
                          </span>
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
                          {bookingData.serviceProvider?.profilePicture && (
                            <img
                              src={`${FILE_URL}/profile/${bookingData.serviceProvider.profilePicture}`}
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
                          {bookingData.serviceProvider?.name}
                        </h2>

                        <div className="mt-4">
                          <div className="mb-4 rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaLocationPin className="text-[#40A579]" />
                              <span className="font-medium">Location</span>
                            </div>
                            {bookingData.serviceProvider?.location
                              ?.coordinates && (
                              <div className="text-sm">
                                <p>
                                  Coordinates:{" "}
                                  {
                                    bookingData.serviceProvider.location
                                      .coordinates[1]
                                  }
                                  ,{" "}
                                  {
                                    bookingData.serviceProvider.location
                                      .coordinates[0]
                                  }
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
                                  {bookingData.serviceProvider?.reviewStats
                                    ?.totalRating || 0}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Average Rating
                                </p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold">
                                  {bookingData.serviceProvider?.reviewStats
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
                          to={`/user/${bookingData.serviceProvider?._id}`}
                          className="mt-2"
                        >
                          <div className="mb-4 rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaUser className="text-[#40A579]" />
                              <span className="font-medium">Contact</span>
                            </div>
                            <div className="text-sm">
                              <p className="mb-1">
                                Email: {bookingData.serviceProvider?.email}
                              </p>
                              <p>ID: {bookingData.serviceProvider?._id}</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Service Seeker
                      </h3>
                    </div>
                    <div className="p-7">
                      <div className="mb-4 flex flex-col gap-1">
                        <div className="self-center rounded-full">
                          {bookingData.user?.profilePicture && (
                            <img
                              src={`${FILE_URL}/profile/${bookingData.user.profilePicture}`}
                              width={50}
                              height={50}
                              style={{
                                objectFit: "cover",
                                marginBottom: "20px",
                                borderRadius: "50%",
                                width: "50px",
                                height: "50px",
                              }}
                              alt="Service Seeker"
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
                          {bookingData.user?.name}
                        </h2>

                        <div className="mt-4">
                          <div className="mb-4 rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaLocationPin className="text-[#40A579]" />
                              <span className="font-medium">Location</span>
                            </div>
                            {bookingData.user?.location?.coordinates && (
                              <div className="text-sm">
                                <p>
                                  Coordinates:{" "}
                                  {bookingData.user.location.coordinates[1]},{" "}
                                  {bookingData.user.location.coordinates[0]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/user/${bookingData.user?._id}`}
                          className="mt-2"
                        >
                          <div className="mb-4 rounded border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaUser className="text-[#40A579]" />
                              <span className="font-medium">Contact</span>
                            </div>
                            <div className="text-sm">
                              <p className="mb-1">
                                Email: {bookingData.user?.email}
                              </p>
                              <p>ID: {bookingData.user?._id}</p>
                            </div>
                          </div>
                        </Link>
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

export default SingleBooking;
