import { useState, useEffect } from 'react';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import {
  API_URL,
  fetcherWithCredentials,
  PRIMARY_COLOR,
} from '../../constants';
import useSWR, { mutate } from 'swr';
import Loader from '../../components/common/Loader';
import Alert from '../../components/Alert';
import { MdEdit } from 'react-icons/md';
import { CiSearch } from 'react-icons/ci';
import { PiTrash } from 'react-icons/pi';
import DeleteModal from '../../modal/DeleteModal';
import toast from 'react-hot-toast';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';

// Define the FAQ type based on the backend model
interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Debounce hook to delay search input */
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const FAQManagement = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'asc',
  });
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState('');
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    isActive: true,
  });
  const limit = 10;

  // Debounced search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Build query parameters
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (debouncedSearchTerm) {
    query.append('search', debouncedSearchTerm);
  }

  if (sortConfig.key) {
    query.append('sortKey', sortConfig.key);
    query.append('sortDirection', sortConfig.direction);
  }

  // Fetch data using SWR
  const { data, error, isLoading } = useSWR(
    `${API_URL}/faq/all?${query.toString()}`,
    fetcherWithCredentials
  );

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      toast.loading('Adding FAQ...');

      const response = await fetch(`${API_URL}/faq/create`, {
        method: 'POST',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.error) {
        setShowAddModal(false);
        setFormData({
          question: '',
          answer: '',
          category: 'General',
          isActive: true,
        });
        toast.dismiss();
        toast.success('FAQ added successfully');
        // Refetch data
        mutate(`${API_URL}/faq/all?${query.toString()}`);
      } else {
        toast.dismiss();
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      toast.loading('Updating FAQ...');

      const response = await fetch(`${API_URL}/faq/${currentFaq?._id}`, {
        method: 'PUT',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.error) {
        setShowEditModal(false);
        setFormData({
          question: '',
          answer: '',
          category: 'General',
          isActive: true,
        });
        setCurrentFaq(null);
        toast.dismiss();
        toast.success('FAQ updated successfully');
        // Refetch data
        mutate(`${API_URL}/faq/all?${query.toString()}`);
      } else {
        toast.dismiss();
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onConfirmDelete = async () => {
    try {
      toast.loading('Deleting FAQ...');
      setLoading(true);

      const response = await fetch(`${API_URL}/faq/${selectedFaqId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.error) {
        setDeleteModal(false);
        toast.dismiss();
        toast.success('FAQ deleted successfully');
        // Refetch data
        mutate(`${API_URL}/faq/all?${query.toString()}`);
      } else {
        toast.dismiss();
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (faq: FAQ) => {
    setCurrentFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
    });
    setShowEditModal(true);
  };

  const toggleFaqStatus = async (faq: FAQ) => {
    try {
      toast.loading(`${faq.isActive ? 'Deactivating' : 'Activating'} FAQ...`);

      const response = await fetch(`${API_URL}/faq/${faq._id}`, {
        method: 'PUT',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !faq.isActive,
        }),
      });

      const data = await response.json();

      if (!data.error) {
        toast.dismiss();
        toast.success(
          `FAQ ${faq.isActive ? 'deactivated' : 'activated'} successfully`
        );
        // Refetch data
        mutate(`${API_URL}/faq/all?${query.toString()}`);
      } else {
        toast.dismiss();
        toast.error(data.message || 'Something went wrong');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Something went wrong');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DefaultLayout>
      {isLoading ? (
        <Loader opacity={true} />
      ) : (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h4 className="text-xl font-semibold text-black dark:text-white mb-4 md:mb-0">
              FAQ Management
            </h4>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <CiSearch className="absolute left-4 top-3 h-4 w-4" />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                Add New FAQ
              </button>
            </div>
          </div>

          {error && (
            <Alert
              title="Error"
              message="Failed to load FAQs. Please try again later."
            />
          )}

          <div className="max-w-full overflow-x-auto hidden md:block">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th
                    onClick={() => handleSort('question')}
                    className="min-w-[220px] cursor-pointer py-4 px-4 font-medium text-black dark:text-white xl:pl-11"
                  >
                    Question
                    {sortConfig.key === 'question' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Answer
                  </th>

                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Created
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.length > 0 ? (
                  data.data.map((faq: FAQ) => (
                    <tr key={faq._id}>
                      <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {faq.question}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {faq.answer.length > 100
                            ? `${faq.answer.substring(0, 100)}...`
                            : faq.answer}
                        </p>
                      </td>

                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <span
                          className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                            faq.isActive
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-danger bg-opacity-10 text-danger'
                          }`}
                        >
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {formatDate(faq.createdAt)}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <button
                            className="hover:text-primary"
                            onClick={() => openEditModal(faq)}
                            title="Edit FAQ"
                          >
                            <MdEdit className="h-5 w-5 text-primary" />
                          </button>
                          <button
                            className="hover:text-primary"
                            onClick={() => toggleFaqStatus(faq)}
                            title={faq.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {faq.isActive ? (
                              <FaToggleOn className="h-5 w-5 text-success" />
                            ) : (
                              <FaToggleOff className="h-5 w-5 text-danger" />
                            )}
                          </button>
                          <button
                            className="hover:text-primary"
                            onClick={() => {
                              setSelectedFaqId(faq._id);
                              setDeleteModal(true);
                            }}
                            title="Delete FAQ"
                          >
                            <PiTrash className="h-5 w-5 text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="border-b border-[#eee] py-5 px-4 text-center dark:border-strokedark"
                    >
                      No FAQs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden">
            {data.data.map((faq: FAQ) => (
              <div
                key={faq._id}
                className="mb-4 rounded-lg border bg-white p-4 shadow dark:border-strokedark dark:bg-boxdark"
              >
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black dark:text-white">
                      Question:
                    </span>
                    <span className="text-black dark:text-white">
                      {faq.question}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black dark:text-white">
                      Answer:
                    </span>
                    <span className="text-black dark:text-white">
                      {faq.answer.length > 100
                        ? `${faq.answer.substring(0, 100)}...`
                        : faq.answer}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black dark:text-white">
                      Status:
                    </span>
                    <span
                      className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                        faq.isActive
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-danger bg-opacity-10 text-danger'
                      }`}
                    >
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black dark:text-white">
                      Created:
                    </span>
                    <span className="text-black dark:text-white">
                      {formatDate(faq.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black dark:text-white">
                      Actions:
                    </span>
                    <div className="flex items-center space-x-3.5">
                      <button
                        className="hover:text-primary"
                        onClick={() => openEditModal(faq)}
                        title="Edit FAQ"
                      >
                        <MdEdit className="h-5 w-5 text-primary" />
                      </button>
                      <button
                        className="hover:text-primary"
                        onClick={() => toggleFaqStatus(faq)}
                        title={faq.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {faq.isActive ? (
                          <FaToggleOn className="h-5 w-5 text-success" />
                        ) : (
                          <FaToggleOff className="h-5 w-5 text-danger" />
                        )}
                      </button>
                      <button
                        className="hover:text-primary"
                        onClick={() => {
                          setSelectedFaqId(faq._id);
                          setDeleteModal(true);
                        }}
                        title="Delete FAQ"
                      >
                        <PiTrash className="h-5 w-5 text-danger" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {data?.totalPages > 1 && (
                  <div className="flex justify-end gap-2 mt-4 mb-4">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body py-2 px-4 text-sm font-medium text-black hover:bg-primary hover:text-white dark:bg-meta-4 dark:text-white dark:hover:bg-primary ${
                        page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Prev
                    </button>
                    {Array.from(
                      { length: data.totalPages },
                      (_, i) => i + 1
                    ).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`flex h-9 min-w-[36px] items-center justify-center rounded-md ${
                          page === pageNumber
                            ? 'bg-primary text-white'
                            : 'bg-body text-black hover:bg-primary hover:text-white dark:bg-meta-4 dark:text-white dark:hover:bg-primary'
                        } py-2 px-4 text-sm font-medium`}
                        style={{
                          backgroundColor:
                            page === pageNumber ? PRIMARY_COLOR : undefined,
                        }}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      disabled={page === data?.totalPages}
                      onClick={() => setPage(page + 1)}
                      className={`flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body py-2 px-4 text-sm font-medium text-black hover:bg-primary hover:text-white dark:bg-meta-4 dark:text-white dark:hover:bg-primary ${
                        page === data?.totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-8 dark:bg-boxdark">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Add New FAQ
            </h2>
            <form onSubmit={handleAddFaq}>
              <div className="mb-4">
                <label
                  htmlFor="question"
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  Question
                </label>
                <input
                  type="text"
                  id="question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Enter FAQ question"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="answer"
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  Answer
                </label>
                <textarea
                  id="answer"
                  rows={4}
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="Enter FAQ answer"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Status
                </label>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span>Active (visible to users)</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      question: '',
                      answer: '',
                      category: 'General',
                      isActive: true,
                    });
                  }}
                  className="rounded-lg border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary py-2 px-6 font-medium text-white hover:shadow-1 disabled:opacity-70"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {loading ? 'Adding...' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-8 dark:bg-boxdark">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Edit FAQ
            </h2>
            <form onSubmit={handleEditFaq}>
              <div className="mb-4">
                <label
                  htmlFor="edit-question"
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  Question
                </label>
                <input
                  type="text"
                  id="edit-question"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Enter FAQ question"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="edit-answer"
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  Answer
                </label>
                <textarea
                  id="edit-answer"
                  rows={4}
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="Enter FAQ answer"
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Status
                </label>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <span>Active (visible to users)</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({
                      question: '',
                      answer: '',
                      category: 'General',
                      isActive: true,
                    });
                    setCurrentFaq(null);
                  }}
                  className="rounded-lg border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary py-2 px-6 font-medium text-white hover:shadow-1 disabled:opacity-70"
                  style={{ backgroundColor: PRIMARY_COLOR }}
                >
                  {loading ? 'Updating...' : 'Update FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <DeleteModal
          type="faq"
          onCancel={() => setDeleteModal(false)}
          onConfirm={onConfirmDelete}
          loading={loading}
        />
      )}
    </DefaultLayout>
  );
};

export default FAQManagement;
