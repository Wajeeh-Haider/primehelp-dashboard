import { Link } from 'react-router-dom';
import { API_URL, fetcherWithCredentials } from '../../constants';
import useSWR from 'swr';
import Loader from '../common/Loader';
import Alert from '../Alert';
import moment from 'moment';

const ChatCard = () => {
  const { data, error, isLoading } = useSWR(
    `${API_URL}/reported-users`,
    fetcherWithCredentials
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      {data?.error || error ? (
        <Alert
          title="Something went wrong"
          message={data?.message || 'An error occurred while fetching data.'}
        />
      ) : (
        <>
          <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
            Reported Users
          </h4>

          <div>
            {data?.data?.map((chat: any, key: number) => (
              <Link
                to={`/chats/${chat?.chatId}/${chat?.reportedBy?._id}`}
                className="flex items-center gap-5 px-7.5 py-3 hover:bg-gray-3 dark:hover:bg-meta-4"
                key={key}
              >
                <div className="relative h-14 w-14 rounded-full">
                  {chat?.reportedBy?.profilePicture ? (
                    <Link to={`/user/${chat?.reportedBy?._id}`}>
                      <img
                        width={56}
                        height={56}
                        src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${chat.reportedBy.profilePicture}`}
                        alt="User"
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                        }}
                      />
                    </Link>
                  ) : (
                    <Link
                      to={`/user/${chat?.reportedBy?._id}`}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#40A579]"
                    >
                      <span className="text-sm font-medium text-white">
                        {chat.reportedBy.name.charAt(0)}
                      </span>
                    </Link>
                  )}

                  <span
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      !chat?.reportedBy?.isOnline ? 'bg-meta-6' : `bg-meta-${3}`
                    } `}
                  ></span>
                </div>

                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <h5 className="font-medium text-black dark:text-white">
                      {chat?.reportedBy?.name} reported {chat?.userId?.name}
                    </h5>
                    <p>
                      <span className="text-sm text-black dark:text-white">
                        {'Reported at '}
                      </span>
                      <span className="text-xs">
                        {moment(chat?.createdAt).calendar()}
                      </span>
                    </p>
                    <p>
                      {chat?.reason && (
                        <>
                          <span className="text-sm text-black dark:text-white">
                            {'Reason: '}
                          </span>
                          <span className="text-xs text-black dark:text-white">
                            {chat?.reason}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatCard;
