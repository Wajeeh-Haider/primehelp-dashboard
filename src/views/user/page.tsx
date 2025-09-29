'use client';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import useSWR, { mutate } from 'swr';
import { API_URL, fetcherWithCredentials, FILE_URL } from '../../constants';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { FaLocationPin } from 'react-icons/fa6';
import { PiCheckCircleDuotone } from 'react-icons/pi';
import { useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import DatePickerOne from '../../components/FormElements/DatePicker/DatePickerOne';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const SingleUser = () => {
  const router = useNavigate();
  const { id } = useParams();
  const { data, isLoading, error } = useSWR(
    `${API_URL}/users/${id}`,
    fetcherWithCredentials,
  );
  const [values, setValues] = useState({
    fullName: '',
    // phoneNumber removed
    emailAddress: '',
    locationDescription: '',
    subscription: '',
    bio: '',
    subscriptionByAdmin: false,
    businessName: '',
    isBlocked: false,
    isEmailVerified: false,
    isPhoneVerified: false,
    isProfileVerified: false,
    verificationStatus: '',
    zipCode: '',
    reviewStats: { totalRating: 0, totalReviews: 0 },
    createdAt: '',
    updatedAt: '',
  });
  // local UI state
  const [loadingButton, setLoadingButton] = useState('');
  const [changeSubscription, setChangeSubscription] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // verification moderation state
  const [verifActionLoading, setVerifActionLoading] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [reuploadReason, setReuploadReason] = useState('');

  // hydrate values from API response
  useEffect(() => {
    if (data?.data) {
      const d: any = data.data;
      setValues(prev => ({
        ...prev,
        fullName: d.name || '',
        emailAddress: d.email || '',
        locationDescription:
          d.location?.description || d.locationDescription || '',
        subscription: d.subscription || '',
        bio: d.bio || '',
        subscriptionByAdmin: d.subscriptionByAdmin || false,
        businessName: d.businessName || '',
        isBlocked: d.isBlocked || false,
        isEmailVerified: d.isEmailVerified || false,
        isPhoneVerified: d.isPhoneVerified || false,
        isProfileVerified: d.isProfileVerified || false,
        verificationStatus: d.verificationStatus || '',
        zipCode: d.zipCode || '',
        reviewStats: d.reviewStats || { totalRating: 0, totalReviews: 0 },
        createdAt: d.createdAt || '',
        updatedAt: d.updatedAt || '',
      }));

      if (d?.subscriptionDate?.startDate) {
        setStartDate(new Date(d.subscriptionDate.startDate));
      }
      if (d?.subscriptionDate?.endDate) {
        setEndDate(new Date(d.subscriptionDate.endDate));
      }
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <Loader />;
  }

  const handleSaveChanges = (e: any) => {
    e.preventDefault();

    if (
      values.fullName === '' ||
      // phone number validation removed
      values.emailAddress === '' ||
      values.bio === ''
    ) {
      alert('Please fill all the fields');
      return;
    }
    setLoadingButton('save');

    fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'auth-token': `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        name: values.fullName,
        // phoneNumber removed
        email: values.emailAddress,
        bio: values.bio,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data?.error) {
          mutate(`${API_URL}/users/${id}`);
          router('/user/' + id);
          setLoadingButton('');
        }
      })
      .catch(() => {
        toast.error('An error occurred');
        setLoadingButton('');
      });
  };

  const handleApproveAccount = (e: any) => {
    e.preventDefault();
    setLoadingButton('approve');
    fetch(`${API_URL}/users/approve/${id}`, {
      method: 'PUT',
      headers: {
        'auth-token': `${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data?.error) {
          mutate(`${API_URL}/users/${id}`);
          router('/user/' + id);
          setLoadingButton('');
        } else {
          toast.error('An error occurred');
          setLoadingButton('');
        }
      })
      .catch(() => {
        toast.error('An error occurred');
        setLoadingButton('');
      });
  };

  const handleDeactivateAccount = (e: any) => {
    e.preventDefault();
    setLoadingButton('deactivate');
    fetch(`${API_URL}/users/block/${id}`, {
      method: 'PUT',
      headers: {
        'auth-token': `${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data?.error) {
          mutate(`${API_URL}/users/${id}`);
          router('/user/' + id);
          setLoadingButton('');
        } else {
          toast.error('An error occurred');
          setLoadingButton('');
        }
      })
      .catch(() => {
        toast.error('An error occurred');
        setLoadingButton('');
      });
  };

  // requestDocsAgain removed (legacy flow replaced by granular moderation actions)

  // Extract verificationMedia for convenience
  const verificationMedia: any = data?.data?.verificationMedia || {};

  const handleVerificationAction = async (
    type: 'approve' | 'reject' | 'request-reupload',
  ) => {
    if (!id) return;
    try {
      setVerifActionLoading(type);
      const endpointMap: Record<string, string> = {
        approve: `/verifications/approve/${id}`,
        reject: `/verifications/reject/${id}`,
        'request-reupload': `/verifications/request-reupload/${id}`,
      };
      const bodyPayload =
        type === 'reject'
          ? { reason: rejectReason }
          : type === 'request-reupload'
          ? { reason: reuploadReason }
          : {};
      const res = await fetch(`${API_URL}${endpointMap[type]}`, {
        method: 'PUT',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      }).then(r => r.json());
      if (!res.error) {
        toast.success(res.message || 'Action completed');
        mutate(`${API_URL}/users/${id}`);
        setShowRejectModal(false);
        setShowReuploadModal(false);
        setRejectReason('');
        setReuploadReason('');
      } else {
        toast.error(res.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setVerifActionLoading('');
    }
  };

  const changeSubscriptionPlan = (e: any) => {
    e.preventDefault();

    // if start date and end dates are same then show error message check the dates properly
    if (
      startDate &&
      endDate &&
      new Date(startDate).getTime() === new Date(endDate).getTime()
    ) {
      toast.error('Start date and end date cannot be same');
      return;
    }

    fetch(`${API_URL}/users/subscription/${id}`, {
      method: 'PUT',
      headers: {
        'auth-token': `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        subscription: 'premium',
        subscriptionDates: {
          startDate: startDate,
          endDate: endDate,
        },
        subscriptionByAdmin: true,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (!data?.error) {
          mutate(`${API_URL}/users/${id}`);
          setChangeSubscription(false);
        }
      });
  };

  return (
    <DefaultLayout>
      <div className="mx-auto h-screen max-w-270">
        <Breadcrumb pageName={`${data?.data?.name || 'N/A'}`} />
        {error || data?.error ? (
          <Alert
            title="Something went wrong"
            message="There was an error while fetching the user"
          />
        ) : (
          <>
            {(!error || !data?.error) && (
              <div className="grid grid-cols-5 gap-8">
                <div className="col-span-5 xl:col-span-3">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        User Information
                      </h3>
                    </div>
                    <div className="p-7">
                      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/2">
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="fullName"
                          >
                            Full Name
                          </label>
                          <div className="relative">
                            <span className="absolute left-4.5 top-4">
                              <svg
                                className="fill-current"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g opacity="0.8">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                    fill=""
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                    fill=""
                                  />
                                </g>
                              </svg>
                            </span>
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                              type="text"
                              name="fullName"
                              id="fullName"
                              placeholder="Devid Jhon"
                              onChange={handleChange}
                              value={values.fullName}
                            />
                          </div>
                        </div>

                        {/* Phone Number field removed */}
                      </div>

                      <div className="mb-5.5">
                        <div className="flex justify-start gap-2">
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="emailAddress"
                          >
                            Email Address
                          </label>
                          {data?.data?.isEmailVerified && (
                            <PiCheckCircleDuotone className="text-green-500" />
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <svg
                              className="fill-current"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g opacity="0.8">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                                  fill=""
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                                  fill=""
                                />
                              </g>
                            </svg>
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="email"
                            name="emailAddress"
                            id="emailAddress"
                            onChange={handleChange}
                            placeholder="devidjond45@gmail.com"
                            value={values?.emailAddress}
                          />
                        </div>
                      </div>
                      <div className="mb-5.5">
                        <label
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                          htmlFor="location"
                        >
                          Location
                        </label>
                        <div className="relative">
                          <span className="absolute left-4.5 top-4">
                            <FaLocationPin className="text-xl " />
                          </span>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="location"
                            disabled
                            id="location"
                            value={values?.locationDescription}
                          />
                        </div>
                      </div>

                      <div className="mb-5.5 grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="zipCode"
                          >
                            Zip Code
                          </label>
                          <input
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                            type="text"
                            name="zipCode"
                            disabled
                            id="zipCode"
                            value={values.zipCode}
                          />
                        </div>
                        <div>
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="verificationStatus"
                          >
                            Verification Status
                          </label>
                          <div className="relative">
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 capitalize text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                              type="text"
                              name="verificationStatus"
                              disabled
                              id="verificationStatus"
                              value={values.verificationStatus}
                            />
                          </div>
                        </div>
                      </div>

                      {values.businessName && (
                        <div className="mb-5.5">
                          <label
                            className="mb-3 block text-sm font-medium text-black dark:text-white"
                            htmlFor="businessName"
                          >
                            Business Name
                          </label>
                          <div className="relative">
                            <span className="absolute left-4.5 top-4">
                              <svg
                                className="fill-current"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g opacity="0.8">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M1.56524 3.23223C2.03408 2.76339 2.66997 2.5 3.33301 2.5H9.16634C9.62658 2.5 9.99967 2.8731 9.99967 3.33333C9.99967 3.79357 9.62658 4.16667 9.16634 4.16667H3.33301C3.11199 4.16667 2.90003 4.25446 2.74375 4.41074C2.58747 4.56702 2.49967 4.77899 2.49967 5V16.6667C2.49967 16.8877 2.58747 17.0996 2.74375 17.2559C2.90003 17.4122 3.11199 17.5 3.33301 17.5H14.9997C15.2207 17.5 15.4326 17.4122 15.5889 17.2559C15.7452 17.0996 15.833 16.8877 15.833 16.6667V10.8333C15.833 10.3731 16.2061 10 16.6663 10C17.1266 10 17.4997 10.3731 17.4997 10.8333V16.6667C17.4997 17.3297 17.2363 17.9656 16.7674 18.4344C16.2986 18.9033 15.6627 19.1667 14.9997 19.1667H3.33301C2.66997 19.1667 2.03408 18.9033 1.56524 18.4344C1.0964 17.9656 0.833008 17.3297 0.833008 16.6667V5C0.833008 4.33696 1.0964 3.70107 1.56524 3.23223Z"
                                    fill=""
                                  />
                                </g>
                              </svg>
                            </span>
                            <input
                              className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                              type="text"
                              name="businessName"
                              id="businessName"
                              disabled
                              value={values.businessName}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-4.5">
                        <div className="flex justify-start gap-4.5">
                          <button
                            disabled={loadingButton !== ''}
                            className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white flex-1"
                            onClick={handleSaveChanges}
                          >
                            {loadingButton === 'save' ? (
                              <div role="status">
                                <svg
                                  aria-hidden="true"
                                  className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                  />
                                </svg>
                                <span className="sr-only">Loading...</span>
                              </div>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                          <button
                            disabled={loadingButton !== ''}
                            className="flex justify-center  rounded bg-[#40A579] px-6 py-2 font-medium text-gray hover:bg-opacity-90 flex-1"
                            onClick={handleApproveAccount}
                          >
                            {loadingButton === 'approve' ? (
                              <div role="status">
                                <svg
                                  aria-hidden="true"
                                  className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                  />
                                </svg>
                                <span className="sr-only">Loading...</span>
                              </div>
                            ) : data?.data?.isProfileVerified ? (
                              'Deactivate '
                            ) : (
                              'Approve '
                            )}
                          </button>
                          <button
                            className="flex justify-center rounded bg-red-500 px-6 py-2 font-medium text-gray hover:bg-opacity-90 flex-1"
                            onClick={handleDeactivateAccount}
                            disabled={loadingButton !== ''}
                          >
                            {loadingButton === 'deactivate' ? (
                              <div role="status">
                                <svg
                                  aria-hidden="true"
                                  className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                  />
                                </svg>
                                <span className="sr-only">Loading...</span>
                              </div>
                            ) : data?.data?.isBlocked ? (
                              'Unblock Account'
                            ) : (
                              'Block Account'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-5 xl:col-span-2">
                  <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="flex justify-between border-b border-stroke px-7 py-4 dark:border-strokedark">
                      <h3 className="font-medium text-black dark:text-white">
                        Profile
                      </h3>
                      {data?.data?.isOnline && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-green-500"></span>
                          <span className="text-green-500">Online</span>
                        </span>
                      )}
                    </div>
                    <div className="p-7">
                      <form action="#">
                        <div className="mb-4 flex flex-col gap-1">
                          <div className="self-center rounded-full">
                            {data?.data?.profilePicture && (
                              <img
                                src={`${FILE_URL}/profile/${data?.data?.profilePicture}`}
                                width={100}
                                height={100}
                                style={{
                                  objectFit: 'cover',
                                  marginBottom: '20px',
                                }}
                                alt="User"
                              />
                            )}
                          </div>
                          <h2
                            className="text-center text-black dark:text-white"
                            style={{ fontSize: '1.5rem' }}
                          >
                            {data?.data?.name}
                          </h2>

                          <div className="mt-4 border-t border-stroke pt-4 dark:border-strokedark">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-black dark:text-white">
                                  Email Verified
                                </h3>
                                <span
                                  className={`text-sm ${
                                    values.isEmailVerified
                                      ? 'text-green-500'
                                      : 'text-red-500'
                                  }`}
                                >
                                  {values.isEmailVerified ? 'Yes' : 'No'}
                                </span>
                              </div>
                              {/* Phone Verified summary removed */}
                              <div>
                                <h3 className="text-sm font-medium text-black dark:text-white">
                                  Profile Verified
                                </h3>
                                <span
                                  className={`text-sm ${
                                    values.isProfileVerified
                                      ? 'text-green-500'
                                      : 'text-red-500'
                                  }`}
                                >
                                  {values.isProfileVerified ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-black dark:text-white">
                                  Account Status
                                </h3>
                                <span
                                  className={`text-sm ${
                                    values.isBlocked
                                      ? 'text-red-500'
                                      : 'text-green-500'
                                  }`}
                                >
                                  {values.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-stroke pt-4 dark:border-strokedark">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium text-black dark:text-white">
                                  Created:
                                </span>
                                <span className="ml-1 text-black dark:text-white">
                                  {new Date(
                                    values.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-black dark:text-white">
                                  Updated:
                                </span>
                                <span className="ml-1 text-black dark:text-white">
                                  {new Date(
                                    values.updatedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  {(verificationMedia?.faceImage ||
                    verificationMedia?.idFrontImage ||
                    verificationMedia?.idBackImage) && (
                    <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <div className="flex items-center justify-between border-b border-stroke px-7 py-4 dark:border-strokedark">
                        <h3 className="font-medium text-black dark:text-white">
                          Verification Media
                        </h3>
                        <span className="text-xs capitalize rounded bg-gray-200 px-2 py-1 dark:bg-meta-4 dark:text-white">
                          {values.verificationStatus || 'n/a'}
                        </span>
                      </div>
                      <div className="p-7 space-y-6">
                        {verificationMedia?.rejectionReason && (
                          <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300">
                            <strong>Reviewer Note:</strong>{' '}
                            {verificationMedia.rejectionReason}
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          {verificationMedia?.faceImage?.url && (
                            <div>
                              <p className="mb-2 text-xs font-medium text-black dark:text-white">
                                Face Image
                              </p>
                              <img
                                src={verificationMedia.faceImage.url}
                                alt="Face"
                                className="h-40 w-full rounded object-cover ring-1 ring-stroke dark:ring-strokedark"
                              />
                            </div>
                          )}
                          {verificationMedia?.idFrontImage?.url && (
                            <div>
                              <p className="mb-2 text-xs font-medium text-black dark:text-white">
                                ID Front
                              </p>
                              <img
                                src={verificationMedia.idFrontImage.url}
                                alt="ID Front"
                                className="h-40 w-full rounded object-cover ring-1 ring-stroke dark:ring-strokedark"
                              />
                            </div>
                          )}
                          {verificationMedia?.idBackImage?.url && (
                            <div>
                              <p className="mb-2 text-xs font-medium text-black dark:text-white">
                                ID Back
                              </p>
                              <img
                                src={verificationMedia.idBackImage.url}
                                alt="ID Back"
                                className="h-40 w-full rounded object-cover ring-1 ring-stroke dark:ring-strokedark"
                              />
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          {verificationMedia?.documentType && (
                            <div>
                              <span className="font-medium text-black dark:text-white">
                                Document Type:{' '}
                              </span>
                              <span className="capitalize">
                                {verificationMedia.documentType}
                              </span>
                            </div>
                          )}
                          {verificationMedia?.submittedAt && (
                            <div>
                              <span className="font-medium text-black dark:text-white">
                                Submitted:{' '}
                              </span>
                              <span>
                                {new Date(
                                  verificationMedia.submittedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {verificationMedia?.reviewedAt && (
                            <div>
                              <span className="font-medium text-black dark:text-white">
                                Reviewed:{' '}
                              </span>
                              <span>
                                {new Date(
                                  verificationMedia.reviewedAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Moderation buttons relocated below media & metadata */}
                        {!values.isProfileVerified &&
                          values.verificationStatus !== 'approved' && (
                            <div className="pt-4 border-t border-stroke dark:border-strokedark flex flex-wrap gap-3">
                              <button
                                type="button"
                                disabled={verifActionLoading !== ''}
                                onClick={() =>
                                  handleVerificationAction('approve')
                                }
                                className="flex items-center gap-1 rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                              >
                                {verifActionLoading === 'approve' ? (
                                  'Processing...'
                                ) : (
                                  <>
                                    <FaCheck /> Approve
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                disabled={verifActionLoading !== ''}
                                onClick={() => setShowRejectModal(true)}
                                className="flex items-center gap-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                              >
                                <FaTimes /> Reject
                              </button>
                              <button
                                type="button"
                                disabled={verifActionLoading !== ''}
                                onClick={() => setShowReuploadModal(true)}
                                className="flex items-center gap-1 rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                              >
                                <FaUndo /> Request Re-upload
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {changeSubscription && (
              // create a modal for changing subscription
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                <div
                  className="d w-96 rounded-sm bg-white
            p-5 shadow-default dark:bg-boxdark dark:shadow-strokedark
            "
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-dark text-xl font-semibold dark:text-white">
                      Change Subscription
                    </h3>
                    <button
                      onClick={() => setChangeSubscription(false)}
                      className="text-red-500"
                    >
                      x
                    </button>
                  </div>
                  <div className="mt-5">
                    <div className="mb-5">
                      <DatePickerOne
                        value={startDate || new Date()}
                        setValue={val => setStartDate(val)}
                        start={true}
                      />
                    </div>
                    <DatePickerOne
                      value={endDate || new Date()}
                      setValue={val => setEndDate(val)}
                    />
                  </div>
                  <div className="mt-5 flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-[#40A579] px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      onClick={changeSubscriptionPlan}
                    >
                      Change Subscription
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded bg-white p-6 shadow dark:bg-boxdark">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Reject Verification
              </h3>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason"
                className="w-full rounded border border-stroke p-2 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                rows={4}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    !rejectReason.trim() || verifActionLoading === 'reject'
                  }
                  onClick={() => handleVerificationAction('reject')}
                  className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {verifActionLoading === 'reject' ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Re-upload Modal */}
        {showReuploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded bg-white p-6 shadow dark:bg-boxdark">
              <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Request Re-upload
              </h3>
              <textarea
                value={reuploadReason}
                onChange={e => setReuploadReason(e.target.value)}
                placeholder="Enter instructions for re-upload"
                className="w-full rounded border border-stroke p-2 text-sm dark:border-strokedark dark:bg-meta-4 dark:text-white"
                rows={4}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowReuploadModal(false)}
                  className="rounded border border-stroke px-4 py-2 text-sm dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    !reuploadReason.trim() ||
                    verifActionLoading === 'request-reupload'
                  }
                  onClick={() => handleVerificationAction('request-reupload')}
                  className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {verifActionLoading === 'request-reupload'
                    ? 'Processing...'
                    : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default SingleUser;
