import { useState, useMemo, useEffect } from "react";
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import { API_URL, fetcherWithCredentials } from "../../constants";
import useSWR, { mutate } from "swr";
import Loader from "../../components/common/Loader";
import Alert from "../../components/Alert";
import { CiSearch } from "react-icons/ci";

import moment from "moment";
import { Link } from "react-router-dom";
import ContactUsReplyModal from "../../modal/ContactUsReplyModal";
import toast from "react-hot-toast";

const Contact = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const { data, error, isLoading } = useSWR(
    `${API_URL}/contact-us`,
    fetcherWithCredentials
  );

  // Handle search
  const filteredContacts = useMemo(() => {
    if (!data) return [];

    return data?.data?.filter(
      (contact: any) =>
        contact?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        contact?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        contact?.message?.toLowerCase()?.includes(searchTerm?.toLowerCase())
    );
  }, [data, searchTerm]);

  const openModal = (contact: any) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  useEffect(() => {
    if (!selectedContact) return;
    if (selectedContact.read) {
      setResponseMessage(selectedContact.response);
    }
  }, [selectedContact]);

  const onSend = async () => {
    if (!selectedContact || !responseMessage) return;

    if (selectedContact.read) {
      toast.error("You cannot send response to this contact");
      return;
    }
    toast.loading("Sending response...");
    try {
      const response = await fetch(`${API_URL}/contact-us/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          response: responseMessage,
          contactUsId: selectedContact._id,
        }),
      });

      const result = await response.json();

      if (result.error) {
        toast.dismiss();
        toast.error(result.message);
        throw new Error(result.message);
      }
      toast.dismiss();
      toast.success("Response sent successfully");

      setShowModal(false);
      setResponseMessage("");
      setSelectedContact(null);
      mutate(`${API_URL}/contact-us`);
    } catch (error) {
      if (error instanceof Error) {
        toast.dismiss();
        toast.error(error.message);
      }
    }
  };

  // if (isLoading) return <Loader opacity={true} />;

  return (
    <DefaultLayout>
      {isLoading ? (
        <Loader opacity={true} />
      ) : (
        <div className="h-screen">
          {data?.error && error ? (
            <Alert
              title="Something went wrong"
              message={data?.message || "An error occurred while fetching data."}
            />
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div className="mb-4">
                  <div className="relative">
                    <input
                      placeholder="Search for contacts"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-[#40A579] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-[#40A579]"
                    />

                    <span className="absolute right-4 top-4">
                      <CiSearch className="text-xl text-[#40A579]" />
                    </span>
                  </div>
                </div>

                <div className="w-full">
                  {filteredContacts && filteredContacts.length > 0 ? (
                    <>
                      {/* Mobile View */}
                      <div className="block md:hidden">
                        {filteredContacts.map((contact: any, index: number) => (
                          <div
                            key={index}
                            className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="mb-2">
                              <span className="font-semibold">Id:</span>{" "}
                              {contact?._id}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">User:</span>{" "}
                              {contact?.user ? (
                                <Link to={`/user/${contact?.user?._id}`}>
                                  {contact?.user?.profilePicture ? (
                                    <img
                                      src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${contact?.user?.profilePicture}`}
                                      alt="profile"
                                      width={30}
                                      height={30}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
                                      {contact?.user?.name
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                  )}
                                </Link>
                              ) : (
                                "N/A"
                              )}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Name:</span>{" "}
                              {contact?.name}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Email:</span>{" "}
                              {contact?.email}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">About:</span>{" "}
                              {contact?.about}
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Response:</span>{" "}
                              <button
                                className="bg-[#40A579] text-white px-4 py-2 rounded-lg"
                                onClick={() => openModal(contact)}
                              >
                                {contact?.read ? "View Response" : "Reply"}
                              </button>
                            </div>
                            <div className="mb-2">
                              <span className="font-semibold">Created At:</span>{" "}
                              {moment(contact?.createdAt).calendar()}
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
                                  Name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Email
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  About
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
                              {filteredContacts.map(
                                (contact: any, index: number) => (
                                  <tr
                                    className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
                                    key={index}
                                  >
                                    <td className="px-6 py-4">
                                      {contact?._id}
                                    </td>

                                    <td className="px-6 py-4">
                                      {contact?.user ? (
                                        <Link
                                          to={`/user/${contact?.user?._id}`}
                                        >
                                          {contact?.user?.profilePicture ? (
                                            <img
                                              src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${contact?.user?.profilePicture}`}
                                              alt="profile"
                                              width={30}
                                              height={30}
                                              className="rounded-full"
                                            />
                                          ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
                                              {contact?.user?.name
                                                .charAt(0)
                                                .toUpperCase()}
                                            </div>
                                          )}
                                        </Link>
                                      ) : (
                                        "N/A"
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      {contact?.name}
                                    </td>
                                    <td className="px-6 py-4">
                                      {contact?.email}
                                    </td>
                                    <td className="px-6 py-4">
                                      {contact?.about}
                                    </td>
                                    <td className="px-6 py-4">
                                      <button
                                        className="bg-[#40A579] text-white px-4 py-2 rounded-lg"
                                        onClick={() => openModal(contact)}
                                      >
                                        {contact?.read ? "View" : "Reply"}
                                      </button>
                                    </td>
                                    <td className="px-6 py-4">
                                      {moment(contact?.createdAt).calendar()}
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
                    <div>No contacts found.</div>
                  )}
                </div>

                {showModal && selectedContact && (
                  <ContactUsReplyModal
                    contact={selectedContact}
                    onClose={() => {
                      setShowModal(false);
                      setResponseMessage("");
                      setSelectedContact(null);
                    }}
                    responseMessage={responseMessage}
                    setResponseMessage={setResponseMessage}
                    onSend={onSend}
                  />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default Contact;
