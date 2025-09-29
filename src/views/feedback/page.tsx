"use client";
import { useState, useMemo, useEffect } from "react";
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import { API_URL, fetcherWithCredentials } from "../../constants";
import useSWR, { mutate } from "swr";
import Loader from "../../components/common/Loader";
import Alert from "../../components/Alert";
import { CiSearch } from "react-icons/ci";

import moment from "moment";
import FeedbackReplyModal from "../../modal/FeedbackReplyModal";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Feedbacks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const { data, error, isLoading } = useSWR(
    `${API_URL}/feedback`,
    fetcherWithCredentials
  );

  // Handle search
  const filteredFeedbacks = useMemo(() => {
    if (!data) return [];

    return data?.data?.filter((feedback: any) =>
      feedback?.feedback?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
  }, [data, searchTerm]);

  // Handle sorting
  const sortedFeedbacks = useMemo(() => {
    if (!filteredFeedbacks || !sortConfig) return filteredFeedbacks;

    const sortedData = [...filteredFeedbacks].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Convert boolean values to numbers for sorting
      if (typeof aValue === "boolean") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sortedData;
  }, [filteredFeedbacks, sortConfig]);

  const openModal = (feedback: any) => {
    setIsModalOpen(true);
    setSelectedFeedback(feedback);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!selectedFeedback) return;
    if (selectedFeedback.rating < 1 || selectedFeedback.rating > 5) return;
    if (selectedFeedback.read) {
      setResponseMessage(selectedFeedback.response);
      return;
    }
    if (selectedFeedback.rating < 3) {
      setResponseMessage(
        "We are truly sorry to hear that your experience with DinePals did not meet your expectations. Your feedback is incredibly valuable to us, and we are committed to making things right. Please know that we take your concerns seriously and will work diligently to improve our services. Thank you for giving us the opportunity to learn and grow."
      );
    } else if (selectedFeedback.rating >= 3 && selectedFeedback.rating < 4) {
      setResponseMessage(
        "Thank you for sharing your thoughts with us! We are glad to hear that you had a satisfactory experience with DinePals. We strive to make every dining experience exceptional and will continue working hard to exceed your expectations. Your feedback helps us improve, and we appreciate your support."
      );
    } else if (selectedFeedback.rating >= 4) {
      setResponseMessage(
        "Fantastic! We are thrilled to know that you enjoyed your experience with DinePals. Your satisfaction is our top priority, and your positive feedback motivates us to keep delivering great service. Thank you for being a part of our community, and we look forward to serving you again soon!"
      );
    }
  }, [selectedFeedback]);

  const onSend = async () => {
    if (!responseMessage) {
      toast.error("Please enter a response message");
      return;
    }
    if (!selectedFeedback) return;

    if (selectedFeedback.read) {
      toast.error("You have already responded to this feedback");
      return;
    }

    const sendResponse = async () => {
      const response = await fetch(`${API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          response: responseMessage,
          feedbackId: selectedFeedback._id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send response");
      }

      mutate(`${API_URL}/feedback`);

      setIsModalOpen(false);
      setSelectedFeedback(null);
      setResponseMessage("");
    };

    toast.promise(sendResponse(), {
      loading: "Sending your response...",
      success: "Response sent successfully!",
      error: "An error occurred while sending your response.",
    });
  };

  // if (isLoading) return <Loader opacity={true} />;

  return (
    <DefaultLayout>
      {isLoading ? (
        <Loader opacity={true} />
      ) : (
        <div className="h-screen">
          {data?.error && error && (
            <Alert
              title="Something went wrong"
              message={data?.message || "An error occurred while fetching data."}
            />
          )}
          <div className="flex flex-col gap-3">
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <input
                  placeholder="Search for feedbacks"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579]"
                />
                <span className="absolute right-4 top-4">
                  <CiSearch className="text-xl text-[#40A579]" />
                </span>
              </div>
            </div>

            {/* Feedback Data */}
            <div className="w-full">
              {sortedFeedbacks && sortedFeedbacks.length > 0 ? (
                <>
                  {/* Mobile View */}
                  <div className="block md:hidden">
                    {sortedFeedbacks.map((feedback: any, index: number) => (
                      <div
                        key={index}
                        className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="mb-2">
                          <span className="font-semibold">Id:</span>{" "}
                          {feedback?._id}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">User:</span>{" "}
                          <Link to={`/user/${feedback?.user?._id}`}>
                            {feedback?.user?.profilePicture ? (
                              <img
                                src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${feedback?.user?.profilePicture}`}
                                alt="profile"
                                width={30}
                                height={30}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
                                {feedback?.user?.name
                                  ?.charAt(0)
                                  .toUpperCase() || ""}
                              </div>
                            )}
                          </Link>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Feedback:</span>{" "}
                          {feedback?.feedback}
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Response:</span>{" "}
                          <button
                            className="bg-[#40A579] text-white px-2 py-1 rounded-md outline-none focus:outline-none"
                            onClick={() => openModal(feedback)}
                          >
                            {feedback?.read ? "View Response" : "Reply"}
                          </button>
                        </div>
                        <div className="mb-2">
                          <span className="font-semibold">Created At:</span>{" "}
                          {moment(feedback?.createdAt).calendar()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block">
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th
                              scope="col"
                              className="cursor-pointer px-6 py-3"
                            >
                              Id
                            </th>
                            <th scope="col" className="px-6 py-3">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Feedback
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Response
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Created At
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedFeedbacks.map(
                            (feedback: any, index: number) => (
                              <tr
                                className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                key={index}
                              >
                                <td className="px-6 py-4">{feedback?._id}</td>
                                <td className="px-6 py-4">
                                  <Link to={`/user/${feedback?.user?._id}`}>
                                    {feedback?.user?.profilePicture ? (
                                      <img
                                        src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${feedback?.user?.profilePicture}`}
                                        alt="profile"
                                        width={30}
                                        height={30}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
                                        {feedback?.user?.name
                                          ?.charAt(0)
                                          .toUpperCase() || ""}
                                      </div>
                                    )}
                                  </Link>
                                </td>
                                <td className="px-6 py-4">
                                  {feedback?.feedback}
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    className="bg-[#40A579] text-white px-2 py-1 rounded-md outline-none focus:outline-none"
                                    onClick={() => openModal(feedback)}
                                  >
                                    {feedback?.read ? "View Response" : "Reply"}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  {moment(feedback?.createdAt).calendar()}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div>No feedbacks found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedFeedback && (
        <FeedbackReplyModal
          feedback={selectedFeedback}
          responseMessage={responseMessage}
          setResponseMessage={setResponseMessage}
          onSend={onSend}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFeedback(null);
          }}
        />
      )}
    </DefaultLayout>
  );
};

export default Feedbacks;
