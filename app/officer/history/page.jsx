"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function VerificationHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
    // Show all apps that are NOT still pending
    const processed = globalApps.filter(app => app.status && app.status !== 'Pending Verification');
    // Sort newest first by verified_at or submitted_at
    processed.sort((a, b) => new Date(b.verified_at || b.submitted_at) - new Date(a.verified_at || a.submitted_at));
    setHistory(processed);
    setLoading(false);
  };

  const getStatusStyle = (status) => {
    if (!status) return 'bg-gray-50 text-gray-600';
    if (status === 'Verified') return 'bg-green-50 text-green-700 border-green-200';
    if (status.includes('Flagged')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (status === 'Rejected') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'Approved & Disbursed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Verification History</h1>
        <p className="text-gray-500 mt-2">A complete log of all applications that have been reviewed.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-orange-50 border-b border-orange-100">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-600">Reviewed At</th>
                <th className="px-6 py-4 font-medium text-gray-600">App ID</th>
                <th className="px-6 py-4 font-medium text-gray-600">Student Name</th>
                <th className="px-6 py-4 font-medium text-gray-600">Scholarship</th>
                <th className="px-6 py-4 font-medium text-gray-600">Decision</th>
                <th className="px-6 py-4 font-medium text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(item.verified_at || item.submitted_at).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.id}</td>
                  <td className="px-6 py-4 text-gray-800">{item.student_name}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-[180px] truncate" title={item.scholarship_name}>
                    {item.scholarship_name}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={getStatusStyle(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={item.remark}>
                    {item.remark || '—'}
                  </td>
                </tr>
              ))}
              {!loading && history.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No verification history found. Reviewed applications will appear here.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}