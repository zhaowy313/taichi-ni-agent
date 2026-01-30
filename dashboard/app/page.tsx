'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserData(token);
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const res = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/me/key', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const { key } = await res.json();
        setUser({ ...user, apiKey: key });
      }
    } catch (err) {
      alert('Failed to generate key');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <button 
            onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Account Information</h2>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Current Balance:</span> <span className="text-green-600 font-bold">${user?.balance?.toFixed(2)}</span></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">API Key</h2>
            {user?.apiKey ? (
              <div className="flex items-center gap-4">
                <code className="bg-gray-100 p-2 rounded block flex-1 overflow-x-auto">
                  {user.apiKey}
                </code>
                <button 
                  onClick={() => { navigator.clipboard.writeText(user.apiKey); alert('Copied!'); }}
                  className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 transition"
                >
                  Copy
                </button>
              </div>
            ) : (
              <p className="text-gray-500 italic">No active API key.</p>
            )}
            
            <button
              onClick={handleGenerateKey}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {user?.apiKey ? 'Regenerate Key' : 'Generate Key'}
            </button>
            <p className="text-xs text-gray-400 mt-2">* Note: Regenerating a key will revoke your current one.</p>
          </section>

          <section className="bg-blue-50 p-4 rounded-md">
            <h2 className="text-md font-semibold text-blue-800 mb-2">Top-up Balance</h2>
            <p className="text-sm text-blue-700 mb-4">Automatic payments are coming soon. For now, please contact support to add credit.</p>
            <button className="bg-blue-800 text-white text-sm px-4 py-2 rounded">Contact Admin</button>
          </section>
        </div>
      </div>
    </div>
  );
}