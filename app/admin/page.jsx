"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const STATUS_COLORS = { 'Approved & Disbursed': '#22c55e', 'Verified': '#22c55e', 'Pending Verification': '#f97316', 'Flagged': '#eab308', 'Rejected': '#ef4444' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { computeStats(); }, []);

  const computeStats = () => {
    try {
      const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
      const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');

      let approved = 0, flagged = 0, rejected = 0, pending = 0, totalPaid = 0;
      const stateMap = {}, genderMap = {}, casteMap = {}, schMap = {};

      const SCHOLARSHIP_AMOUNTS = {
        'Pre-Matric Scholarship for ST Students': 3000,
        'Post-Matric Scholarship for ST Students': 10000,
        'National Fellowship for Higher Education of ST Students': 400000
      };

      globalApps.forEach(app => {
        const st = app.status || '';
        const schName = app.scholarship_name || '';
        
        if (st === 'Approved & Disbursed') { 
          approved++; 
          totalPaid += (SCHOLARSHIP_AMOUNTS[schName] || 50000); 
        }
        else if (st === 'Verified') approved++;
        else if (st === 'Rejected') rejected++;
        else if (st.includes('Flagged')) flagged++;
        else pending++;

        const state = app.personal_data?.state || 'Unknown';
        stateMap[state] = (stateMap[state] || 0) + 1;
        const gender = app.personal_data?.gender || 'Unknown';
        genderMap[gender] = (genderMap[gender] || 0) + 1;
        const caste = app.personal_data?.caste || 'Unknown';
        casteMap[caste] = (casteMap[caste] || 0) + 1;
        const sch = app.scholarship_name || 'Other';
        schMap[sch] = (schMap[sch] || 0) + 1;
      });

      const total = globalApps.length;
      const voCount = Object.values(usersDb).filter(u => u.role === 'VERIFYING_OFFICER').length;
      const studentCount = Object.values(usersDb).filter(u => !u.role || u.role === 'STUDENT').length;

      setStats({
        total, approved, flagged, rejected, pending, totalPaid, voCount, studentCount,
        allApps: globalApps,
        stateData: Object.entries(stateMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 8),
        genderData: Object.entries(genderMap).map(([name, value]) => ({ name, value })),
        casteData: Object.entries(casteMap).map(([name, value]) => ({ name, value })),
        schData: Object.entries(schMap).map(([name, value]) => ({ name, value })),
        statusData: [
          { name: 'Approved / Verified', value: approved },
          { name: 'Pending', value: pending },
          { name: 'Flagged', value: flagged },
          { name: 'Rejected', value: rejected },
        ].filter(d => d.value > 0),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleExportCSV = () => {
    const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
    let csv = "Student Name,Scholarship,State,Gender,Category,Status,Submitted At\n";
    globalApps.forEach(app => {
      csv += `"${app.student_name}","${app.scholarship_name}","${app.personal_data?.state || ''}","${app.personal_data?.gender || ''}","${app.personal_data?.caste || ''}","${app.status}","${app.submitted_at}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "scholarship_report.csv"; a.click();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!stats) return null;

  const PIE_COLORS = ['#f97316', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-gray-800">System Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">{stats.total} total applications registered in the system</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: stats.total },
          { label: 'Approved / Verified', value: stats.approved },
          { label: 'Flagged', value: stats.flagged },
          { label: 'Rejected', value: stats.rejected },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-extrabold text-orange-500">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', value: stats.pending },
          { label: 'Total Amount Paid', value: `Rs. ${stats.totalPaid.toLocaleString()}` },
          { label: 'Registered Students', value: stats.studentCount },
          { label: 'Verifying Officers', value: stats.voCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Application Status Breakdown</h3>
          {stats.statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {stats.statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No applications yet</div>
          )}
        </div>

        {/* State Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">State-wise Applications</h3>
          {stats.stateData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.stateData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#fff7ed' }} contentStyle={{ borderRadius: 8, border: '1px solid #fed7aa', fontSize: 12 }} />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gender */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Gender Distribution</h3>
          {stats.genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={stats.genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {stats.genderData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center mt-12">No data yet</p>}
        </div>

        {/* Caste */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Category Distribution</h3>
          {stats.casteData.length > 0 ? (
            <div className="space-y-3 mt-2">
              {stats.casteData.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{c.name}</span>
                    <span className="font-semibold text-gray-800">{c.value}</span>
                  </div>
                  <div className="h-2 bg-orange-50 rounded-full">
                    <div className="h-2 bg-orange-400 rounded-full" style={{ width: `${Math.max(8, (c.value / (stats.total || 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center mt-12">No data yet</p>}
        </div>

        {/* Scholarship-wise */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Scholarship-wise</h3>
          {stats.schData.length > 0 ? (
            <div className="space-y-3 mt-2">
              {stats.schData.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 truncate max-w-[70%]">{s.name}</span>
                    <span className="font-semibold text-gray-800">{s.value}</span>
                  </div>
                  <div className="h-2 bg-orange-50 rounded-full">
                    <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${Math.max(8, (s.value / (stats.total || 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center mt-12">No data yet</p>}
        </div>
      </div>

      {/* Full Applications Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">All Applications</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-orange-50 text-xs text-gray-500 uppercase border-b border-orange-100">
              <tr>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Scholarship</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats.allApps || []).map((app, i) => (
                <tr key={i} className="hover:bg-orange-50/30">
                  <td className="px-6 py-3 font-medium text-gray-900">{app.student_name}</td>
                  <td className="px-6 py-3 text-gray-500">{app.scholarship_name}</td>
                  <td className="px-6 py-3 text-gray-500">{app.personal_data?.state || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{app.personal_data?.gender || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">{app.personal_data?.caste || '—'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      app.status === 'Approved & Disbursed' || app.status === 'Verified' ? 'bg-green-100 text-green-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      app.status?.includes('Flagged') ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{app.status}</span>
                  </td>
                </tr>
              ))}
              {(stats.allApps || []).length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No applications submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}