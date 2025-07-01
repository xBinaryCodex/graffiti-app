import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    tag_name: '',
    crew: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          tag_name: formData.tag_name || undefined,
          crew: formData.crew || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // Registration successful - now log them in
      const loginFormData = new FormData();
      loginFormData.append('username', formData.username);
      loginFormData.append('password', formData.password);

      const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        body: loginFormData,
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem('token', loginData.access_token);
        navigate('/');
      } else {
        // Registration succeeded but login failed - redirect to login page
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Join Graffiti App
          </h1>
          <p className="text-gray-400 mt-2">Create your digital black book</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Username *
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tag Name
            </label>
            <input
              type="text"
              value={formData.tag_name}
              onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your graffiti name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Crew
            </label>
            <input
              type="text"
              value={formData.crew}
              onChange={(e) => setFormData({ ...formData, crew: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Your crew name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter password again"
            />
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}