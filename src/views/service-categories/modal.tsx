import React, { useState } from 'react';
import { API_URL } from '../../constants';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  editing: any; // existing category or null
}

const ServiceCategoryModal: React.FC<Props> = ({
  onClose,
  onSuccess,
  editing,
}) => {
  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [imageUrl, setImageUrl] = useState(editing?.imageUrl || ''); // existing remote URL (for edit)
  const [file, setFile] = useState<File | null>(null); // newly selected file (pending upload)
  const [uploading, setUploading] = useState(false); // true while uploading inside submit
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const disabled = !title || (!imageUrl && !file) || saving || uploading;

  const submit = async () => {
    try {
      setSaving(true);
      toast.loading(editing ? 'Updating category...' : 'Creating category...');

      let finalImageUrl = imageUrl;

      // Upload new file first (if selected)
      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        const uploadRes = await fetch(
          `${API_URL}/service-categories/upload-image`,
          {
            method: 'POST',
            headers: { 'auth-token': `${localStorage.getItem('token')}` },
            body: formData,
          },
        ).then(r => r.json());
        if (!uploadRes.success) {
          throw new Error(uploadRes.message || 'Image upload failed');
        }
        finalImageUrl = uploadRes.url;
        setImageUrl(finalImageUrl);
        setUploading(false);
      }

      const res = await fetch(
        `${API_URL}/service-categories${editing ? '/' + editing._id : ''}`,
        {
          method: editing ? 'PUT' : 'POST',
          headers: {
            'auth-token': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description, imageUrl: finalImageUrl }),
        },
      ).then(r => r.json());

      toast.dismiss();
      if (res.success) {
        toast.success(editing ? 'Category updated' : 'Category created');
        onSuccess();
      } else {
        toast.error(res.message || 'Operation failed');
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message || 'Operation failed');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow max-w-lg w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {editing ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full rounded border px-3 py-2 text-sm focus:border-[#40A579] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded border px-3 py-2 text-sm focus:border-[#40A579] outline-none resize-y"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Image<span className="text-red-500">*</span>
            </label>
            <div
              className={`mt-1 border-2 border-dashed rounded p-4 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#40A579] bg-[#40A579]/5'
                  : 'border-gray-300 hover:border-[#40A579]'
              }`}
              onDragEnter={e => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragOver={e => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={e => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={e => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped && dropped.type.startsWith('image/')) {
                  setFile(dropped);
                } else if (dropped) {
                  toast.error('Please drop an image file');
                }
              }}
              onClick={() => {
                document.getElementById('service-category-file-input')?.click();
              }}
            >
              <input
                id="service-category-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />
              <p className="text-xs text-gray-600">
                {file
                  ? 'Ready to upload new image on save'
                  : 'Click or drag & drop an image here'}
              </p>
              <p className="mt-1 text-[10px] text-gray-400">
                PNG/JPG up to ~5MB
              </p>
              {file && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-24 w-24 object-cover rounded border"
                  />
                  <span className="text-[11px] text-gray-500 break-all max-w-[200px]">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              {!file && imageUrl && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <img
                    src={imageUrl}
                    alt="current"
                    className="h-24 w-24 object-cover rounded border"
                  />
                  <p className="text-[11px] break-all text-gray-500 max-w-[220px]">
                    {imageUrl}
                  </p>
                </div>
              )}
            </div>
            {(uploading || saving) && (
              <p className="text-xs text-gray-500 mt-2">
                {uploading ? 'Uploading image...' : saving ? 'Saving...' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border"
            type="button"
          >
            Cancel
          </button>
          <button
            disabled={disabled}
            onClick={submit}
            className="px-4 py-2 text-sm rounded bg-[#40A579] text-white disabled:opacity-50"
            type="button"
          >
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategoryModal;
