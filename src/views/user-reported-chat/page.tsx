import { useParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import Loader from '../../components/common/Loader';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import { API_URL, fetcherWithCredentials } from '../../constants';
import useSWR from 'swr';

const Avatar = ({
  name,
  profilePicture,
}: {
  name: string;
  profilePicture?: string;
}) => {
  return profilePicture ? (
    <img
      src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${profilePicture}`}
      alt={name}
      width={40}
      height={40}
      className="rounded-full"
    />
  ) : (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const OnlineStatus = ({ isOnline }: { isOnline: boolean }) => (
  <span
    className={`h-3 w-3 rounded-full ${
      isOnline ? 'bg-green-500' : 'bg-gray-500'
    }`}
  />
);

const ReportedChats = () => {
  const { id } = useParams();
  const { reportedUserId } = useParams();
  const { data, error, isLoading } = useSWR(
    `${API_URL}/messages-reported-user/${id}`,
    fetcherWithCredentials
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <DefaultLayout>
      <div
        className="container flex h-screen w-full 
        flex-col p-4"
      >
        {data.error || error ? (
          <Alert
            title="Something went wrong"
            message={data?.message || 'An error occurred while fetching data.'}
          />
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-black dark:text-white">
              Chat with {data.data[0]?.receiver?.name}
            </h1>
            <div className="chat-window flex flex-col-reverse overflow-y-auto">
              {data.data.map((message: any) => {
                const isCurrentUser = message.sender._id === reportedUserId;
                const otherUser = isCurrentUser
                  ? message.receiver
                  : message.sender;

                return (
                  <div
                    key={message._id}
                    className={`message flex items-center gap-2 p-2 ${
                      isCurrentUser ? 'justify-end text-right' : 'justify-start'
                    }`}
                  >
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={otherUser?.name}
                          profilePicture={otherUser?.profilePicture}
                        />
                        <div className="flex flex-col">
                          <OnlineStatus isOnline={otherUser?.isOnline} />
                        </div>
                      </div>
                    )}
                    <div
                      className={`message-content rounded-lg p-2 px-4 ${
                        isCurrentUser
                          ? 'bg-[#40A579] text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      <p>{message?.message}</p>
                      <span className="text-xs text-white">
                        {new Date(message?.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {isCurrentUser && (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col text-right">
                          <OnlineStatus
                            isOnline={message?.receiver?.isOnline}
                          />
                        </div>
                        <Avatar
                          name={message?.sender?.name}
                          profilePicture={message?.sender?.profilePicture}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ReportedChats;
