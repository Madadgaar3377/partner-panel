import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';

const MyAgents = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  const fetchMyAgents = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${baseApi}/partner/myAgents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setList(data.data);
      } else {
        setError(data.message || 'Failed to load agents');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/');
      return;
    }
    fetchMyAgents();
  }, [navigate]);

  const handleUnlink = async (agentId) => {
    if (!window.confirm('Remove this agent from your list?')) return;
    try {
      setRemoving(agentId);
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${baseApi}/partner/unlinkAgent/${agentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setList((prev) => prev.filter((item) => item.agentId !== agentId));
      } else {
        alert(data.message || 'Failed to remove agent');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-red-600" />
              My Agents
            </h1>
            <p className="text-gray-600 mt-1">
              Orders from your products will be auto-assigned to one of these agents. If you have none, orders go to other available agents.
            </p>
            <p className="text-sm text-gray-500 mt-1">You can add as many agents as you need — no limit.</p>
          </div>
          <button
            onClick={() => navigate('/agents/add')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-md transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add more agents
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">You have not added any agents yet.</p>
            <button
              onClick={() => navigate('/agents/add')}
              className="text-red-600 font-semibold hover:underline"
            >
              Add your first agent
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => {
              const agent = item.agent || {};
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{agent.name || '—'}</p>
                    {agent.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                        <Mail className="w-4 h-4" /> {agent.email}
                      </p>
                    )}
                    {agent.phoneNumber && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {agent.phoneNumber}
                      </p>
                    )}
                    {agent.Address && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {agent.Address}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Added {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : ''}</p>
                  </div>
                  <button
                    onClick={() => handleUnlink(item.agentId)}
                    disabled={removing === item.agentId}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Remove from my agents"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgents;
