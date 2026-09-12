import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EnquiryManager() {
  const { token } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [notes, setNotes] = useState('');

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setEnquiries(json);
      }
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/enquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchEnquiries();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ internal_notes: notes })
      });
      if (res.ok) {
        fetchEnquiries();
        setSelectedEnquiry(null);
      }
    } catch (err) {
      console.error('Save notes error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive/delete this enquiry?')) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEnquiries();
      }
    } catch (err) {
      console.error('Delete enquiry error:', err);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.mobile.includes(search) ||
      (e.jewellery_type && e.jewellery_type.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'CONTACTED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'IN PROGRESS':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default:
        return 'bg-accent-gold/10 text-accent-gold';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Customer Inquiries
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Enquiry Management
          </h1>
        </div>
        <span className="text-xs text-[#F5F2EB]/60">
          Total Enquiries: <strong className="text-accent-gold">{enquiries.length}</strong>
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-[#181818] p-4 rounded-xl border border-[#2A2A2A]">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by client or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-2 text-xs text-[#F9F6F0] focus:border-accent-gold outline-none w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-2 text-xs text-[#F9F6F0] focus:border-accent-gold outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      {filteredEnquiries.length === 0 ? (
        <div className="text-center py-12 bg-[#181818] border border-[#2A2A2A] rounded-2xl">
          <span className="material-symbols-outlined text-accent-gold text-4xl mb-2">inbox</span>
          <p className="text-xs text-[#F5F2EB]/60">No customer enquiries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => {
            const waNumClean = enq.mobile.replace(/[^0-9]/g, '');
            const replyUrl = `https://wa.me/${waNumClean.length === 10 ? '91' + waNumClean : waNumClean}?text=Hello%20${encodeURIComponent(enq.name)},%20thank%20you%20for%20contacting%20Latha%20Jewellery%20Works!`;

            return (
              <div
                key={enq.id}
                className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start hover:border-accent-gold/40 transition-colors shadow-lg"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-bold text-[#F9F6F0] text-base">{enq.name}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] rounded-full uppercase font-bold border ${getStatusBadge(enq.status)}`}>
                      {enq.status}
                    </span>
                    <span className="text-[11px] text-[#F5F2EB]/40">
                      {new Date(enq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-[#F5F2EB]/80 font-medium">
                    <span>Phone: <strong className="text-accent-gold">{enq.mobile}</strong></span>
                    {enq.email && <span>Email: {enq.email}</span>}
                    <span>Type: <strong className="text-accent-gold">{enq.jewellery_type}</strong></span>
                  </div>

                  <p className="text-xs text-[#F5F2EB]/70 font-light bg-[#121212] p-3 rounded-lg border border-[#2A2A2A] mt-2">
                    "{enq.requirements || 'No specific description provided.'}"
                  </p>

                  {enq.internal_notes ? (
                    <div className="text-[11px] text-amber-400/90 bg-amber-500/10 p-2.5 rounded border border-amber-500/20 mt-2">
                      <strong>Internal Note:</strong> {enq.internal_notes}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-auto">
                  <select
                    value={enq.status}
                    onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                    className="bg-[#121212] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-[#F9F6F0] focus:border-accent-gold outline-none"
                  >
                    <option value="NEW">Set NEW</option>
                    <option value="CONTACTED">Set CONTACTED</option>
                    <option value="IN PROGRESS">Set IN PROGRESS</option>
                    <option value="COMPLETED">Set COMPLETED</option>
                    <option value="CLOSED">Set CLOSED</option>
                  </select>

                  <a
                    href={replyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs uppercase font-bold flex items-center justify-center gap-1 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span> Reply WhatsApp
                  </a>

                  <button
                    onClick={() => {
                      setSelectedEnquiry(enq);
                      setNotes(enq.internal_notes || '');
                    }}
                    className="px-4 py-2 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB]/80 rounded-lg text-xs uppercase hover:text-accent-gold transition-colors"
                  >
                    Edit Note
                  </button>

                  <button
                    onClick={() => handleDelete(enq.id)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs uppercase hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Internal Notes Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1B1A] border border-[#2A2A2A] max-w-md w-full p-6 rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline text-2xl font-bold text-accent-gold mb-2 uppercase">
              Internal Admin Note
            </h3>
            <p className="text-xs text-[#F5F2EB]/60 mb-4">
              Client: {selectedEnquiry.name} ({selectedEnquiry.mobile})
            </p>

            <textarea
              rows="4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
              placeholder="Enter internal notes, customization details, gemstone choices..."
            ></textarea>

            <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB] rounded-lg text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-6 py-2 bg-accent-gold text-[#121212] font-bold rounded-lg text-xs uppercase tracking-wider"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
