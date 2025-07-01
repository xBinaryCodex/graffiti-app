import { useState } from 'react';

interface UploadProps {
  onSuccess: () => void;
  onClose: () => void;
}

const pieceTypes = [
  { value: 'tag', label: 'Tag' },
  { value: 'throwie', label: 'Throwie' },
  { value: 'hollow', label: 'Hollow' },
  { value: 'straight_letter', label: 'Straight Letter' },
  { value: 'piece', label: 'Piece' },
  { value: 'blockbuster', label: 'Blockbuster' },
  { value: 'wildstyle', label: 'Wildstyle' },
  { value: 'stencil', label: 'Stencil' },
  { value: 'wheatpaste', label: 'Wheatpaste' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'digital', label: 'Digital' },
  { value: 'sketch', label: 'Sketch' },
];

const surfaces = [
  { value: 'wall', label: 'Wall' },
  { value: 'train', label: 'Train' },
  { value: 'canvas', label: 'Canvas' },
  { value: 'blackbook', label: 'Blackbook' },
  { value: 'digital', label: 'Digital' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'poster', label: 'Poster' },
  { value: 'other', label: 'Other' },
];

export default function Upload({ onSuccess, onClose }: UploadProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    piece_type: 'piece',
    surface: 'wall',
    location: '',
    is_public: true,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('File must be an image (JPEG, PNG, GIF, or WebP)');
        return;
      }

      setFile(selectedFile);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to upload');
      }

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('piece_type', formData.piece_type);
      uploadData.append('surface', formData.surface);
      uploadData.append('location', formData.location);
      uploadData.append('is_public', formData.is_public.toString());
      uploadData.append('image', file);

      const response = await fetch('http://localhost:8000/api/pieces/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload piece');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Upload New Piece</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer block"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center hover:border-purple-500 transition">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <div className="text-gray-400">Click to upload image</div>
                      <div className="text-sm text-gray-500 mt-1">Max 10MB</div>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Give your piece a name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Tell the story behind this piece..."
              />
            </div>

            {/* Piece Type and Surface */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.piece_type}
                  onChange={(e) => setFormData({ ...formData, piece_type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {pieceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Surface *
                </label>
                <select
                  required
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {surfaces.map((surface) => (
                    <option key={surface.value} value={surface.value}>
                      {surface.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Where was this created? (optional)"
              />
            </div>

            {/* Privacy */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_public" className="text-sm">
                Make this piece public (visible to everyone)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !file}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload Piece'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}