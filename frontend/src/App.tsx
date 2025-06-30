import { useState, useEffect } from 'react';

function App() {
  const [pieces, setPieces] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    
    // Load pieces
    loadPieces();
  }, []);

  const loadPieces = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching pieces...');
      // Direct fetch without the api service for now
      const response = await fetch('http://localhost:8000/api/pieces/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to load pieces: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Pieces data:', data);
      setPieces(data);
    } catch (error) {
      console.error('Error loading pieces:', error);
      setError(`Failed to load pieces: ${error.message}. Make sure the backend is running on port 8000.`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    try {
      const formData = new FormData();
      formData.append('username', 'testuser');
      formData.append('password', 'password123');
      
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setIsLoggedIn(true);
      alert('Logged in successfully!');
      // Reload pieces to get user-specific data
      loadPieces();
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed! Make sure backend is running and user exists.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    loadPieces();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Graffiti App
          </h1>
          <div>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleTestLogin}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition"
              >
                Test Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Recent Pieces</h2>
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
              <div key={piece.id} className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition">
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
                  <p className="text-gray-400 text-sm mb-2">
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
  );
}

export default App;