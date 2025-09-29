const DeleteModal = ({
  type,
  onConfirm,
  onCancel,
  loading,
}: {
  type: "user" | "admin" | "booking" | "meal" | "recipe" | "faq";
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg w-96">
        <h2 className="text-xl font-semibold">Delete {type}</h2>
        <p className="text-gray-500">
          Are you sure you want to delete this {type}?
        </p>
        <div className="flex justify-end mt-4">
          <button
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            disabled={loading}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
