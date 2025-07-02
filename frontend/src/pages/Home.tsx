import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';

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

// Modal component using portal
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const modalRoot = document.getElementById('modal-root');
  
  if (!modalRoot) {
    const div = document.createElement('div');
    div.id = 'modal-root';
    document.body.appendChild(div);
    return ReactDOM.createPortal(
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}
        onClick={onClose}
      >
        <div onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>,
      div
    );
  }
  
  return ReactDOM.createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    modalRoot
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [pieces, setPieces] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    piece_type: 'piece',
    surface: 'wall',
    location: '',
    is_public: true,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    loadPieces();
  }, []);

  const loadPieces = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:8000/api/pieces/');
      
      if (!response.ok) {
        throw new Error(`Failed to load pieces: ${response.status}`);
      }
      
      const data = await response.json();
      setPieces(data);
    } catch (error) {
      console.error('Error loading pieces:', error);
      setError(`Failed to load pieces. Make sure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('File must be an image (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      setUploadFile(file);
      setUploadError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      setUploadError('Please select an image');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to upload');
      }

      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('piece_type', uploadForm.piece_type);
      formData.append('surface', uploadForm.surface);
      formData.append('location', uploadForm.location);
      formData.append('is_public', uploadForm.is_public.toString());
      formData.append('image', uploadFile);

      const response = await fetch('http://localhost:8000/api/pieces/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      // Success!
      alert('Piece uploaded successfully!');
      setShowUpload(false);
      // Reset form
      setUploadForm({
        title: '',
        description: '',
        piece_type: 'piece',
        surface: 'wall',
        location: '',
        is_public: true,
      });
      setUploadFile(null);
      setUploadPreview('');
      loadPieces();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload piece');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Graffiti App
            </h1>
            <div className="flex gap-2">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
                  >
                    + Upload
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold">Recent Pieces</h2>
              <p className="text-gray-400 mt-1">
                {pieces.length} piece{pieces.length !== 1 ? 's' : ''} in the gallery
              </p>
            </div>
            <button
              onClick={loadPieces}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Refresh
            </button>
          </div>
          
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 p-4 rounded mb-6">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : pieces.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No pieces yet. Be the first to upload!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pieces.map((piece: any) => (
                <div key={piece.id} className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition cursor-pointer">
                  <img
                    src={`http://localhost:8000${piece.image_url}`}
                    alt={piece.title}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{piece.title}</h3>
                    <p 
                      className="text-gray-400 text-sm mb-2 cursor-pointer hover:text-purple-400 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/${piece.artist?.username}`);
                      }}
                    >
                      by {piece.artist?.tag_name || piece.artist?.username || 'Unknown'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                        {piece.piece_type?.replace('_', ' ') || 'unknown'}
                      </span>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>❤️ {piece.likes_count || 0}</span>
                        <span>💬 {piece.comments_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal using Portal */}
      {showUpload && (
        <Modal onClose={() => setShowUpload(false)}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '8px',
            maxWidth: '672px',
            width: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            color: 'white',
            margin: '16px'
          }}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Upload New Piece</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  style={{ color: '#9ca3af', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUploadSubmit}>
                {/* Image Upload */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    {uploadPreview ? (
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        style={{ width: '100%', height: '256px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '256px',
                        border: '2px dashed #4b5563',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                          <div style={{ color: '#9ca3af' }}>Click to upload image</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Max 10MB</div>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {/* Title */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#374151',
                      borderRadius: '8px',
                      border: 'none',
                      color: 'white'
                    }}
                    placeholder="Give your piece a name"
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#374151',
                      borderRadius: '8px',
                      border: 'none',
                      color: 'white',
                      minHeight: '80px'
                    }}
                    rows={3}
                    placeholder="Tell the story behind this piece..."
                  />
                </div>

                {/* Type and Surface */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Type *
                    </label>
                    <select
                      required
                      value={uploadForm.piece_type}
                      onChange={(e) => setUploadForm({ ...uploadForm, piece_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#374151',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white'
                      }}
                    >
                      {pieceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                      Surface *
                    </label>
                    <select
                      required
                      value={uploadForm.surface}
                      onChange={(e) => setUploadForm({ ...uploadForm, surface: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#374151',
                        borderRadius: '8px',
                        border: 'none',
                        color: 'white'
                      }}
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
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={uploadForm.location}
                    onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#374151',
                      borderRadius: '8px',
                      border: 'none',
                      color: 'white'
                    }}
                    placeholder="Where was this created? (optional)"
                  />
                </div>

                {/* Privacy */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={uploadForm.is_public}
                    onChange={(e) => setUploadForm({ ...uploadForm, is_public: e.target.checked })}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor="is_public" style={{ fontSize: '14px' }}>
                    Make this piece public (visible to everyone)
                  </label>
                </div>

                {/* Error Message */}
                {uploadError && (
                  <div style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.2)',
                    border: '1px solid #dc2626',
                    color: '#f87171',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    {uploadError}
                  </div>
                )}

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
                  <button
                    type="submit"
                    disabled={uploadLoading || !uploadFile}
                    style={{
                      flex: 1,
                      backgroundColor: uploadLoading || !uploadFile ? '#4b5563' : '#7c3aed',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      color: 'white',
                      cursor: uploadLoading || !uploadFile ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload Piece'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    style={{
                      flex: 1,
                      backgroundColor: '#4b5563',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}