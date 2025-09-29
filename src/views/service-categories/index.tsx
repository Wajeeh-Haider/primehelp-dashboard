import { useState, useEffect } from 'react';
import DefaultLayout from '../../components/Layouts/DefaultLayout';
import { API_URL, fetcherWithCredentials } from '../../constants';
import useSWR, { mutate } from 'swr';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { CiSearch } from 'react-icons/ci';
import { PiTrash, PiPencilSimple } from 'react-icons/pi';
import ServiceCategoryModal from './modal';
import DeleteModal from '../../modal/DeleteModal';

interface ServiceCategory {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const ServiceCategoriesPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ServiceCategory | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (debouncedSearch) query.append('search', debouncedSearch);

  const { data, error, isLoading } = useSWR(
    `${API_URL}/service-categories?${query.toString()}`,
    fetcherWithCredentials,
  );

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };
  const openEdit = (cat: ServiceCategory) => {
    setEditing(cat);
    setShowModal(true);
  };

  const refetch = () =>
    mutate(`${API_URL}/service-categories?${query.toString()}`);

  const onDelete = async () => {
    if (!selectedId) return;
    try {
      setLoadingAction(true);
      toast.loading('Deleting...');
      const res = await fetch(`${API_URL}/service-categories/${selectedId}`, {
        method: 'DELETE',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }).then(r => r.json());
      toast.dismiss();
      if (res.success) {
        toast.success('Deleted');
        setDeleteModal(false);
        refetch();
      } else toast.error(res.message || 'Delete failed');
    } catch (e: any) {
      toast.dismiss();
      toast.error('Delete failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleActive = async (cat: ServiceCategory) => {
    try {
      toast.loading('Updating...');
      const res = await fetch(`${API_URL}/service-categories/${cat._id}`, {
        method: 'PUT',
        headers: {
          'auth-token': `${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !cat.isActive }),
      }).then(r => r.json());
      toast.dismiss();
      if (res.success) {
        toast.success('Updated');
        refetch();
      } else toast.error(res.message || 'Update failed');
    } catch (e: any) {
      toast.dismiss();
      toast.error('Update failed');
    }
  };

  return (
    <DefaultLayout>
      {isLoading ? (
        <Loader opacity={true} />
      ) : (
        <div className="h-screen">
          {error || !data?.success ? (
            <div className="text-red-600">Error loading categories</div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={openCreate}
                    className="bg-[#40A579] py-3 px-5 text-sm md:text-base font-medium text-white rounded hover:opacity-90"
                  >
                    Add Category
                  </button>
                  <div className="relative w-64">
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search categories"
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-4 pr-10 text-black outline-none focus:border-[#40A579]"
                    />
                    <CiSearch className="absolute top-3.5 right-3 text-xl text-[#40A579]" />
                  </div>
                </div>

                <div className="w-full">
                  {data.data && data.data.length ? (
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full table-auto text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                          <tr>
                            <th className="px-4 py-2">Title</th>
                            <th className="px-4 py-2">Image</th>
                            <th className="px-4 py-2">Active</th>
                            <th className="px-4 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.data.map((cat: ServiceCategory) => (
                            <tr key={cat._id} className="border-b bg-white">
                              <td className="px-4 py-2 font-medium">
                                {cat.title}
                              </td>
                              <td className="px-4 py-2">
                                {cat.imageUrl && (
                                  <img
                                    src={cat.imageUrl}
                                    alt={cat.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => toggleActive(cat)}
                                  className={`px-3 py-1 rounded text-white text-xs ${
                                    cat.isActive
                                      ? 'bg-green-600'
                                      : 'bg-gray-400'
                                  }`}
                                >
                                  {cat.isActive ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="px-4 py-2 flex gap-3 items-center">
                                <PiPencilSimple
                                  onClick={() => openEdit(cat)}
                                  className="text-xl cursor-pointer text-[#40A579]"
                                />
                                <PiTrash
                                  onClick={() => {
                                    setSelectedId(cat._id);
                                    setDeleteModal(true);
                                  }}
                                  className="text-xl cursor-pointer text-red-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div>No categories found.</div>
                  )}
                </div>
                {/* Pagination */}
                {data?.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      Page {page} of {data.totalPages} | Total: {data.total}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 bg-[#40A579] text-white rounded disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        disabled={page === data.totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-[#40A579] text-white rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {showModal && (
                <ServiceCategoryModal
                  onClose={() => setShowModal(false)}
                  editing={editing}
                  onSuccess={() => {
                    setShowModal(false);
                    refetch();
                  }}
                />
              )}
              {deleteModal && (
                <>
                  {/* Using 'booking' type as a generic style since DeleteModal type union excludes 'category' */}
                  <DeleteModal
                    onCancel={() => setDeleteModal(false)}
                    onConfirm={onDelete}
                    type="booking"
                    loading={loadingAction}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default ServiceCategoriesPage;
