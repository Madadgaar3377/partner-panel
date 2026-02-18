import React, { useEffect, useState } from 'react';
import { UserPlus, ArrowLeft, Search, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import baseApi from '../../constants/apiUrl';

const AddAgents = () => {
  const navigate = useNavigate();
  const [allAgents, setAllAgents] = useState([]);
  const [myAgentIds, setMyAgentIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [search, setSearch] = useState('');

  const fetchVerifiedAgents = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${baseApi}/getVerifiedAgents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAllAgents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAgents = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${baseApi}/partner/myAgents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMyAgentIds(new Set(data.data.map((d) => d.agentId)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/');
      return;
    }
    setLoading(true);
    Promise.all([fetchVerifiedAgents(), fetchMyAgents()]).finally(() => setLoading(false));
  }, [navigate]);

  const handleAdd = async (agent) => {
    try {
      setAdding(agent.userId);
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${baseApi}/partner/linkAgent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ agentId: agent.userId }),
      });
      const data = await res.json();
      if (data.success) {
        setMyAgentIds((prev) => new Set([...prev, agent.userId]));
      } else {
        alert(data.message || 'Failed to add agent');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setAdding(null);
    }
  };

  const filtered = allAgents.filter(
    (a) =>
      !search ||
      (a.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/agents')}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-7 h-7 text-red-600" />
              Add Agents
            </h1>
            <p className="text-gray-600 mt-1">Select agents to assign to your orders. New orders will be auto-assigned to one of them.</p>
            <p className="text-sm text-gray-500 mt-1">You can add as many agents as you need — 2, 5, 10 or more. There is no limit.</p>
          </div>
        </div>

        {/* Summary: list count + how many already added */}
        {!loading && (
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-gray-700">
              <strong>{filtered.length}</strong> agents in list
            </span>
            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <strong>{myAgentIds.size}</strong> already added by you
            </span>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading agents...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((agent) => {
              const isLinked = myAgentIds.has(agent.userId);
              return (
                <div
                  key={agent.userId}
                  className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{agent.name || '—'}</p>
                    {agent.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {agent.email}
                      </p>
                    )}
                    {agent.phoneNumber && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {agent.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    {isLinked ? (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">Added</span>
                    ) : (
                      <button
                        onClick={() => handleAdd(agent)}
                        disabled={adding === agent.userId}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {adding === agent.userId ? 'Adding...' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {allAgents.length === 0 ? 'No verified agents available yet.' : 'No agents match your search.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddAgents;
