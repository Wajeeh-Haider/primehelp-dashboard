const Loader = ({ opacity = false }) => {
  return (
    <div
      className={`flex h-screen items-center justify-center ${
        opacity ? "opacity-50" : ""
      }`}
    >
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#40A579] border-t-transparent"></div>
    </div>
  );
};

export default Loader;
