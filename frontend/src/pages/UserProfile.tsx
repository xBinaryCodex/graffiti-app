import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [pieces, setPieces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    }
    
    if (username) {
      loadUserData();
    }
  }, [username]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      // Fetch user info
      const userResponse = await fetch(`http://localhost:8000/api/users/${username}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!userResponse.ok) {
        throw new Error('User not found');
      }
      const userData = await userResponse.json();
      setUser(userData);

      // Fetch user's pieces
      const piecesResponse = await fetch(`http://localhost:8000/api/users/${username}/pieces`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (piecesResponse.ok) {
        const piecesData = await piecesResponse.json();
        setPieces(piecesData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <button 
              onClick={() => navigate('/')}
              className="text-purple-400 hover:text-purple-300"
            >
              ← Back to Gallery
            </button>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <button 
              onClick={() => navigate('/')}
              className="text-purple-400 hover:text-purple-300"
            >
              ← Back to Gallery
            </button>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === user.username;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            Graffiti App
          </h1>
          <div className="flex gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => navigate(`/user/${currentUser.username}`)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition"
                >
                  My Profile
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

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Profile Info Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl font-bold">
                {user.tag_name?.[0] || user.username[0].toUpperCase()}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-grow">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold">{user.tag_name || user.username}</h1>
                {user.is_premium && (
                  <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm">
                    Premium
                  </span>
                )}
              </div>
              
              {user.tag_name && (
                <p className="text-gray-400 text-lg mb-2">@{user.username}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-gray-300 mb-4">
                {user.crew && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">👥</span>
                    <span>Crew: <strong className="text-purple-400">{user.crew}</strong></span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span>🎨</span>
                  <span><strong>{pieces.length}</strong> pieces</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span>
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {user.bio && (
                <p className="text-gray-300 text-lg leading-relaxed">{user.bio}</p>
              )}
              
              {isOwnProfile && (
                <button className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pieces Section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {isOwnProfile ? 'Your Pieces' : `Pieces by ${user.tag_name || user.username}`}
          </h2>
          {isOwnProfile && (
            <button 
              onClick={() => navigate('/')}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
            >
              + Upload New
            </button>
          )}
        </div>
        
        {pieces.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xl mb-4">
              {isOwnProfile ? "You haven't uploaded any pieces yet" : "No pieces yet"}
            </p>
            {isOwnProfile && (
              <button 
                onClick={() => navigate('/')}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded transition"
              >
                Upload Your First Piece
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pieces.map((piece) => (
              <div 
                key={piece.id} 
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition cursor-pointer group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={`http://localhost:8000${piece.image_url}`}
                    alt={piece.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  {!piece.is_public && (
                    <div className="absolute top-2 right-2 bg-gray-900/80 px-2 py-1 rounded text-xs">
                      🔒 Private
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{piece.title}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                      {piece.piece_type?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {piece.surface}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{new Date(piece.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-3">
                      <span>❤️ {piece.likes_count || 0}</span>
                      <span>💬 {piece.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}