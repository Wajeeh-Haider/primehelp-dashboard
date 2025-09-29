'use client';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import useSWR, { mutate } from 'swr';
import { API_URL, fetcherWithCredentials } from '../../constants';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { FaLocationPin } from 'react-icons/fa6';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';

const SinglePaymentView = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useSWR(
    `${API_URL}/payment/${id}`,
    fetcherWithCredentials
  );
  const [loadingButton, setLoadingButton] = useState('');

  const handleRefund = (e: any) => {
    e.preventDefault();
    setLoadingButton('refund');

    fetch(`${API_URL}/refund-payment/${id}`, {
      method: 'POST',
      headers: {
        'auth-token': `${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.error) {
          mutate(`${API_URL}/payment/${id}`);
          toast.success('Payment refunded successfully');
          setLoadingButton('');
        } else {
          toast.error(data?.message || 'An error occurred');
          setLoadingButton('');
        }
      })
      .catch(() => {
        toast.error('An error occurred');
        setLoadingButton('');
      });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || data?.error) {
    return (
      <Alert
        title="Something went wrong"
        message="There was an error while fetching the payment details"
      />
    );
  }

  const paymentData = data?.data;

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Payment Details" />

        <div className="grid grid-cols-5 gap-8">
          {/* Payment Information */}
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Payment Information
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Payment ID
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={paymentData?._id}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Amount
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={`$${paymentData?.amount}`}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-5.5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Payment Method
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={paymentData?.paymentMethod}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Stripe Payment Intent
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={paymentData?.stripePaymentIntentId}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-5.5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Created At
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={new Date(paymentData?.createdAt).toLocaleString()}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Updated At
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={new Date(paymentData?.updatedAt).toLocaleString()}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Transfer Status
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                    type="text"
                    value={
                      paymentData?.transferId
                        ? 'Already Transferred to Service Provider'
                        : 'Not Transferred'
                    }
                    disabled
                  />
                </div>

                {paymentData?.refundId ? (
                  <div className="flex justify-end">
                    <button
                      className="flex justify-center rounded bg-gray-500 px-6 py-2 font-medium text-gray cursor-not-allowed"
                      disabled
                    >
                      Already Refunded
                    </button>
                  </div>
                ) : !paymentData?.refundId && !paymentData?.transferId ? (
                  <div className="flex justify-end">
                    <button
                      className="flex justify-center rounded bg-[#40A579] px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      onClick={handleRefund}
                      disabled={loadingButton === 'refund'}
                    >
                      {loadingButton === 'refund' ? (
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
                        'Refund Payment'
                      )}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Booking Details
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Service Seeker
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                    type="text"
                    value={`${paymentData?.bookingId?.user?.name} (${paymentData?.bookingId?.user?.email})`}
                    disabled
                  />
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Service Provider
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                    type="text"
                    value={`${paymentData?.bookingId?.serviceProvider?.name} (${paymentData?.bookingId?.serviceProvider?.email})`}
                    disabled
                  />
                </div>
                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Booking Status
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] capitalize focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                    type="text"
                    value={`${paymentData?.bookingId?.status}`}
                    disabled
                  />
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Location
                  </label>
                  <div className="relative">
                    <span className="absolute left-4.5 top-4">
                      <FaLocationPin className="text-xl" />
                    </span>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={
                        paymentData?.bookingId?.serviceSeekerLocationDescription
                      }
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-5.5 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Date
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={new Date(
                        paymentData?.bookingId?.date
                      ).toLocaleDateString()}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Time
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={`${paymentData?.bookingId?.startTime} - ${paymentData?.bookingId?.endTime}`}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-5.5 grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Price
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={`$${paymentData?.bookingId?.price}`}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      VAT
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={`$${paymentData?.bookingId?.vat}`}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Platform Fee
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      value={`$${paymentData?.bookingId?.platformFee}`}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                    value={paymentData?.bookingId?.description}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SinglePaymentView;
