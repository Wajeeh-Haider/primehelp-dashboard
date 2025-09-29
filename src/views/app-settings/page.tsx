import Loader from '../../components/common/Loader';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import { API_URL, fetcherWithCredentials } from '../../constants';
import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AppSettings = () => {
  const [notification, setNotification] = useState('');
  const [title, setTitle] = useState('');
  const [fee, setFee] = useState({
    vat: '',
    platformFee: '',
    refundFee: '',
    privacyPolicy: '',
    termsAndConditions: '',
  });
  const router = useNavigate();

  const {
    data: appSetting,
    // error,
    isLoading,
  } = useSWR(`${API_URL}/app-setting`, fetcherWithCredentials);

  useEffect(() => {
    if (appSetting) {
      setFee({
        vat: appSetting?.appSetting?.vat || '',
        platformFee: appSetting?.appSetting?.platformFee || '',
        refundFee: appSetting?.appSetting?.refundFee || '',
        privacyPolicy: appSetting?.appSetting?.privacyPolicy || '',
        termsAndConditions: appSetting?.appSetting?.termsAndConditions || '',
      });
    }
  }, [appSetting]);

  const handleSendNotification = async (e: any) => {
    e.preventDefault();
    if (!notification) {
      toast.error('Please enter a notification message');
      return;
    }

    if (!title) {
      toast.error('Please enter a title');
      return;
    }
    toast.loading('Sending notification');
    const response = await fetch(`${API_URL}/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': `${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        message: notification,
        title: title,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setNotification('');
      setTitle('');
      toast.dismiss();
      toast.success('Notification sent successfully');
      router('/app-settings');
    } else {
      toast.dismiss();
      toast.error(data?.message || 'An error occurred');
    }
  };

  const handleSaveVAT = async (e: any) => {
    e.preventDefault();
    toast.loading('Saving settings');
    const response = await fetch(`${API_URL}/app-setting`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': `${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        privacyPolicy: fee.privacyPolicy,
        termsAndConditions: fee.termsAndConditions,
        vat: fee.vat,
        platformFee: fee.platformFee,
        refundFee: fee.refundFee,
      }),
    });

    if (response.ok) {
      toast.dismiss();
      toast.success('Settings updated successfully');
      router('/app-settings');
      mutate(`${API_URL}/app-setting`);
    } else {
      toast.dismiss();
      toast.error('An error occurred');
    }
  };

  if (isLoading) return <Loader opacity={true} />;

  return (
    <DefaultLayout>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="bg-dark h-screen">
          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-5 xl:col-span-2">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Send Notification to All Users
                  </h3>
                </div>
                <div className="flex flex-col gap-2 p-7">
                  <div className="w-full">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="title"
                    >
                      Title
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                        type="text"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        id="title"
                        placeholder="Title"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="notification"
                    >
                      Message
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                        type="text"
                        name="notification"
                        value={notification}
                        onChange={(e) => setNotification(e.target.value)}
                        id="notification"
                        placeholder="Message"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-[#40A579] px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      onClick={handleSendNotification}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-5 xl:col-span-2">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Settings
                  </h3>
                </div>
                <div className="flex flex-col gap-2 p-7">
                  <div className="w-full">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="title"
                    >
                      VAT (%)
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                        type="text"
                        name="title"
                        value={fee.vat}
                        onChange={(e) =>
                          setFee({ ...fee, vat: e.target.value })
                        }
                        id="title"
                        placeholder="VAT %"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="notification"
                    >
                      Platform Fee <small>(Fixed Amount)</small>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                        type="text"
                        name="notification"
                        value={fee.platformFee}
                        onChange={(e) =>
                          setFee({ ...fee, platformFee: e.target.value })
                        }
                        id="notification"
                        placeholder="Platform Fee Fixed"
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="notification"
                    >
                      Refund Fee <small>(Fixed Amount)</small>
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                        type="text"
                        name="notification"
                        value={fee.refundFee}
                        onChange={(e) =>
                          setFee({ ...fee, refundFee: e.target.value })
                        }
                        id="notification"
                        placeholder="Refund Fee Fixed"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-[#40A579] px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      onClick={handleSaveVAT}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-5 xl:col-span-2">
              <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                  <h3 className="font-medium text-black dark:text-white">
                    Link Settings
                  </h3>
                </div>
                <div className="flex flex-col gap-2 p-7">
                  <div className="w-full">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="title"
                    >
                      Terms and Conditions
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                        type="text"
                        name="title"
                        value={fee.termsAndConditions}
                        onChange={(e) =>
                          setFee({ ...fee, termsAndConditions: e.target.value })
                        }
                        id="title"
                        placeholder="Terms and Conditions"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                      htmlFor="notification"
                    >
                      Privacy Policy
                    </label>
                    <div className="relative">
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                        type="text"
                        name="notification"
                        value={fee.privacyPolicy}
                        onChange={(e) =>
                          setFee({ ...fee, privacyPolicy: e.target.value })
                        }
                        id="notification"
                        placeholder="Privacy Policy"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded bg-[#40A579] px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                      onClick={handleSaveVAT}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Free User Restrictions
                </h3>
              </div>
              <div className="flex flex-col gap-2 p-7">
                <div className="w-full">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="title"
                  >
                    Meal Posts Per Month
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      name="mealPosts"
                      value={restrictions.mealPosts}
                      onChange={onChangeRestrictions}
                      placeholder="Meal Posts Per Month"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="notification"
                  >
                    Recipe Posts Per Month
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      name="recipePosts"
                      value={restrictions.recipePosts}
                      onChange={onChangeRestrictions}
                      placeholder="Recipe Posts Per Month"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="notification"
                  >
                    Accept Requests Per Month
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 pl-3 pr-4.5 text-black focus:border-[#40A579] focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-[#40A579]"
                      type="text"
                      name="requests"
                      value={restrictions.requests}
                      onChange={onChangeRestrictions}
                      placeholder="Accept Requests Per Month"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-4.5">
                  <button
                    className="flex justify-center rounded bg-[#40A579] px-6 py-2 font-medium text-gray hover:bg-opacity-90"
                    onClick={freeUserRestrictions}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div> */}
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default AppSettings;
