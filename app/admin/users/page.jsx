"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle } from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    try {
      const db = JSON.parse(localStorage.getItem('users_db') || '{}');
      
      // Build user list from stored users_db
      const userList = Object.keys(db).map(key => {
        const entry = db[key];
        // Determine role: VOs and admins have explicit role field; students may have profile data
        let role = entry.role || 'STUDENT';
        return {
          id: key,
          username: key,
          role,
          status: entry.status || 'ACTIVE'
        };
      });

      // Also include the currently active student if not already in list
      try {
        const activePersonal = JSON.parse(localStorage.getItem('student_personal') || '{}');
        const activeRole = localStorage.getItem('role') || 'STUDENT';
        if (activePersonal.email && !db[activePersonal.email] && activeRole === 'STUDENT') {
          userList.push({
            id: activePersonal.email,
            username: activePersonal.email,
            role: 'STUDENT',
            status: 'ACTIVE'
          });
        }
      } catch(e) {}

      setUsers(userList);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const db = JSON.parse(localStorage.getItem('users_db') || '{}');
      if (db[userId]) {
        db[userId].status = newStatus;
        localStorage.setItem('users_db', JSON.stringify(db));
        fetchUsers();
      } else {
        alert("User not found!");
      }
    } catch(err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  if(loading) return <div className="p-10 text-center">Loading users...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">View and manage all registered users — {users.length} total</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Email / Username</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'VERIFYING_OFFICER' ? 'bg-indigo-100 text-indigo-700' :
                      user.role === 'SYSTEM_ADMIN' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{user.role.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>{user.status || 'ACTIVE'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'SYSTEM_ADMIN' && (
                      <Button
                        variant={user.status === 'ACTIVE' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleSuspend(user.id, user.status || 'ACTIVE')}
                        className="flex items-center gap-1 ml-auto text-xs"
                      >
                        {user.status === 'ACTIVE' ? (
                          <><Ban className="w-3.5 h-3.5 mr-1"/> Suspend</>
                        ) : (
                          <><CheckCircle className="w-3.5 h-3.5 text-green-600 mr-1"/> Reactivate</>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">No users found yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}