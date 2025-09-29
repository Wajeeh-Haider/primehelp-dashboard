const ContactUsReplyModal = ({
  contact,
  responseMessage,
  setResponseMessage,
  onSend,
  onClose,
}: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white w-full max-w-lg p-6 md:p-8 rounded-lg">
        {/* Modal Header */}
        <h1 className="text-xl md:text-2xl font-bold">
          {contact?.read ? 'View Response' : 'Reply'}
        </h1>
        {/* User Information */}
        <div className="flex items-center mt-4">
          {contact?.user?.profilePicture ? (
            <img
              src={`https://dinepals.s3.eu-north-1.amazonaws.com/profile/${contact?.user?.profilePicture}`}
              alt="profile picture"
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 text-white">
              {contact?.user?.name?.charAt(0).toUpperCase() || ''}
            </div>
          )}
          <span className="ml-2">{contact?.user?.name}</span>
        </div>
        {/* Response Form */}
        <form className="mt-4">
          <textarea
            className="w-full h-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Write your reply here..."
            value={responseMessage}
            onChange={(e) => {
              if (contact?.read) {
                return;
              }
              setResponseMessage(e.target.value);
            }}
            readOnly={contact?.read}
          ></textarea>
          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-end mt-4">
            {!contact?.read && (
              <button
                className="w-full md:w-auto mt-2 md:mt-0 bg-green-500 text-white px-4 py-2 rounded-lg"
                onClick={(e) => {
                  e.preventDefault();
                  onSend();
                }}
              >
                Send
              </button>
            )}
            <button
              className="w-full md:w-auto mt-2 md:mt-0 bg-red-500 text-white px-4 py-2 rounded-lg md:ml-4"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              {contact?.read ? 'Close' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUsReplyModal;
