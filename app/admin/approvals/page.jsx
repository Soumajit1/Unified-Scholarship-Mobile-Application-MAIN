"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, AlertCircle, CheckCircle, FileText, X, Eye } from "lucide-react";

export default function AdminApprovalsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState("Approved & Disbursed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const handleViewDocument = async (docKey) => {
    try {
      const localforage = (await import('localforage')).default;
      const usersDbDocs = await localforage.getItem('users_db_docs') || {};
      const email = selectedApp.student_email || selectedApp.personal_data?.email;
      let base64 = null;
      if (email && usersDbDocs[email]?.docData) {
        base64 = usersDbDocs[email].docData[docKey];
      } else {
        // Fallback check current active student if they are somehow viewing it directly
        const activeDocs = await localforage.getItem('student_documents_data');
        if (activeDocs) base64 = activeDocs[docKey];
      }
      if (base64) {
        setViewingDoc(base64);
      } else {
        alert("Document data not found in local database.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load document.");
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = () => {
    try {
      const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
      setApplications(globalApps);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalDecision = () => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
        const updatedApps = globalApps.map(app => {
          if (app.id === selectedApp.id) {
            return { ...app, status: approvalStatus };
          }
          return app;
        });
        localStorage.setItem('global_applications', JSON.stringify(updatedApps));
        setSelectedApp(null);
        fetchQueue();
      } catch(err) {
        console.error("Failed to approve", err);
      } finally {
        setIsSubmitting(false);
      }
    }, 800);
  };

  if(loading) return <div className="p-10 text-center animate-pulse">Loading queue...</div>;

  const verifiedApps = applications.filter(a => a.status === 'Verified');
  const otherApps = applications.filter(a => a.status !== 'Verified' && a.status !== 'Pending Verification');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Final Approval Queue</h1>
          <p className="text-slate-500 text-sm">Review applications verified by officers and grant final approval.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Awaiting Admin Approval ({verifiedApps.length})
        </h2>
        
        {verifiedApps.length === 0 ? (
          <Card className="bg-slate-50 border-dashed border-2 shadow-none">
            <CardContent className="p-12 text-center text-slate-500 flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-slate-300 mb-4" />
              <p className="font-medium text-slate-600">No applications waiting for final approval.</p>
              <p className="text-sm">The queue is completely clear!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {verifiedApps.map(app => (
              <Card key={app.id} className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-lg">{app.student_name}</span>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{app.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FileText className="w-4 h-4" />
                      {app.id} &bull; {app.scholarship_name}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedApp(app)}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    Grant Final Approval
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-8">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
          Recently Processed Logs
        </h2>
        
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">App ID</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Scholarship</th>
                    <th className="px-6 py-3">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {otherApps.slice(0, 10).map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-900">{app.id}</td>
                      <td className="px-6 py-3">{app.student_name}</td>
                      <td className="px-6 py-3 text-slate-500">{app.scholarship_name}</td>
                      <td className="px-6 py-3">
                        <Badge 
                          variant="secondary"
                          className={
                            app.status === 'Approved & Disbursed' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            app.status.includes('Flagged') ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {otherApps.length === 0 && (
                    <tr>
                      <td col colSpan="4" className="px-6 py-4 text-center text-slate-500">
                        No processing history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h2 className="text-xl font-bold">Final Approval Action</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Issuing final system decision for <strong>{selectedApp.student_name}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <section>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">Personal Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500 block">Full Name</span><span className="font-medium">{selectedApp.personal_data?.full_name || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Date of Birth</span><span className="font-medium">{selectedApp.personal_data?.dob || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Gender</span><span className="font-medium">{selectedApp.personal_data?.gender || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Mobile</span><span className="font-medium">{selectedApp.personal_data?.mobile || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Aadhaar No.</span><span className="font-medium">{selectedApp.personal_data?.aadhar_no || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">APAAR ID</span><span className="font-medium">{selectedApp.personal_data?.apaar_id || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Father's Name</span><span className="font-medium">{selectedApp.personal_data?.father_name || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Mother's Name</span><span className="font-medium">{selectedApp.personal_data?.mother_name || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Institution</span><span className="font-medium">{selectedApp.personal_data?.institution || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Location</span><span className="font-medium">{selectedApp.personal_data?.district}, {selectedApp.personal_data?.state || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Income</span><span className="font-medium">₹{selectedApp.personal_data?.family_income || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Caste</span><span className="font-medium">{selectedApp.personal_data?.caste || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Religion</span><span className="font-medium">{selectedApp.personal_data?.religion || 'N/A'}</span></div>
                  
                  <div className="col-span-2 md:col-span-3 mt-2 border-t pt-2"><h4 className="font-semibold text-gray-700 mb-2">Bank Details</h4></div>
                  <div><span className="text-gray-500 block">Bank Name</span><span className="font-medium">{selectedApp.personal_data?.bank_name || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">Account No.</span><span className="font-medium">{selectedApp.personal_data?.account_no || 'N/A'}</span></div>
                  <div><span className="text-gray-500 block">IFSC Code</span><span className="font-medium">{selectedApp.personal_data?.ifsc_code || 'N/A'}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">Educational Details</h3>
                <div className="grid gap-3 text-sm bg-gray-50 p-4 rounded-md border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 border-b border-gray-200 pb-4">
                    <div><span className="text-gray-500 block">Current Course</span><span className="font-medium">{selectedApp.education_data?.currentCourse || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Year/Class</span><span className="font-medium">{selectedApp.education_data?.currentYear || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Academic Year</span><span className="font-medium">{selectedApp.education_data?.currentAcademicYear || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Prev. Percentage</span><span className="font-medium">{selectedApp.education_data?.prevPercentage ? `${selectedApp.education_data.prevPercentage}%` : 'N/A'}</span></div>
                  </div>
                  {selectedApp.education_data?.academics?.filter(a => a.applicability === 'Applicable').map((acad) => (
                    <div key={acad.level} className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                      <div className="font-semibold">{acad.level}</div>
                      <div>{acad.board || '-'}</div>
                      <div>{acad.year || '-'}</div>
                      <div>{acad.perc ? `${acad.perc}%` : '-'}</div>
                    </div>
                  )) || <div className="text-gray-500">No educational details provided.</div>}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800">Uploaded Documents</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedApp.documents && Object.keys(selectedApp.documents).length > 0 ? (
                    Object.entries(selectedApp.documents).map(([key, name]) => (
                      <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span className="truncate flex-1 font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                        <button onClick={() => handleViewDocument(key, name)} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold px-3 py-1 rounded transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 col-span-2">No documents uploaded.</div>
                  )}
                </div>
              </section>

              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-bold text-indigo-700">System Admin Decision</label>
                <select 
                  className="w-full border border-indigo-300 rounded-md p-3 text-sm bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={approvalStatus} 
                  onChange={(e) => setApprovalStatus(e.target.value)}
                >
                  <option value="Approved & Disbursed" className="text-green-700 font-medium">Final Approve & Disburse</option>
                  <option value="Rejected" className="text-red-600 font-medium">Reject</option>
                </select>
              </div>
            </div>
            
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
              <Button 
                onClick={handleFinalDecision} 
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? "Processing..." : "Submit Decision"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewingDoc && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden w-full max-w-4xl h-[85vh] flex flex-col relative">
            <div className="px-4 py-3 border-b bg-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Document Viewer</h3>
              <button onClick={() => setViewingDoc(null)} className="text-gray-500 hover:text-gray-900 bg-white rounded-full p-1 shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
              {viewingDoc.includes('application/pdf') ? (
                <iframe src={viewingDoc} className="w-full h-full" />
              ) : (
                <img src={viewingDoc} className="max-w-full max-h-full object-contain" alt="Document" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
