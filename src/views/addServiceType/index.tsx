import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "../../components/Layouts/DefaultLayout";
import { API_URL, FILE_URL } from "../../constants";
import toast from "react-hot-toast";

const AddOrEditServiceType = () => {
  const [serviceType, setServiceType] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);

  // For previewing newly selected files
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // For displaying the existing images from DB when editing
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch data by ID when editing
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_URL}/service-type/${id}`, {
            headers: {
              "auth-token": `${localStorage.getItem("token")}`,
            },
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.message || "Failed to fetch service type.");
          }

          // Assuming data has shape: { serviceType: string, photos: string[] }
          setServiceType(data?.data?.type || "");
          setExistingImages(
            Array.isArray(data?.data?.image)
              ? data.data.image
              : data?.data?.image
              ? [data.data.image]
              : []
          ); // store existing images

          setLoading(false);
        } catch (err: any) {
          setError(err?.message || "An error occurred while fetching data.");
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleServiceTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServiceType(e.target.value);
    setError(null); // Clear errors when the user changes input
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = e.target.files;
      setFiles(selectedFiles);

      // Create file preview URLs
      const filePreviews = Array.from(selectedFiles).map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewImages(filePreviews);

      setError(null); // Clear errors when the user selects a new file
    } else {
      // If user clears the file input
      setFiles(null);
      setPreviewImages([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // If adding a new entry (no id), we require an image.
    if (!serviceType || (id ? false : !files || files.length === 0)) {
      setError("All fields are required. (Image is required when adding new.)");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("serviceType", serviceType);

    // Add files to FormData if user selected them
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        formData.append("photos", file);
      });
    }

    try {
      const url = id
        ? `${API_URL}/update-service-type/${id}`
        : `${API_URL}/add-service-type`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          "auth-token": `${localStorage.getItem("token")}`,
          "name" : "service-type",
          "type": "service-type"
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Error saving service type.");
      }

      toast.success(
        id
          ? "Service type updated successfully!"
          : "Service type added successfully!"
      );

      if (!id) {
        // Reset form if it's an add action
        setServiceType("");
        setFiles(null);
        setPreviewImages([]);
      }

      // Redirect to a list page or stay on the form
      navigate("/service-types");
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error:", error);
      setError(error.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 shadow-md rounded-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            {id ? "Edit Service Type" : "Add Service Type"}
          </h2>
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {error}
            </div>
          )}

          {/* Service Type Input */}
          <div className="mb-4">
            <label
              htmlFor="serviceType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Service Type
            </label>
            <input
              id="serviceType"
              type="text"
              placeholder="Enter service type"
              value={serviceType}
              onChange={handleServiceTypeChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* File Input (Always show) */}
          <div className="mb-4">
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {id ? "Change/Upload New File" : "Upload File"}
            </label>
            <input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Preview of existing images (only if editing and images exist) */}
          {id && existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Existing Images:
              </p>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img, index) => (
                  <img
                    key={index}
                    src={`${FILE_URL}${img}`} // Or `img` directly if it is a full URL
                    alt={`Existing file ${index}`}
                    className="w-20 h-20 object-cover border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview of newly selected files (if any) */}
          {previewImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                New Image Preview:
              </p>
              <div className="flex flex-wrap gap-2">
                {previewImages.map((previewUrl, index) => (
                  <img
                    key={index}
                    src={previewUrl}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-white rounded-md ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Saving..." : id ? "Update" : "Save"}
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default AddOrEditServiceType;
