"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, AlertTriangle, FileText, XCircle, X } from "lucide-react";

export default function OfficerDashboard() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [remark, setRemark] = useState("");
  const [status, setStatus] = useState("Verified");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
    // Only show apps that are still awaiting verification
    setApplications(globalApps.filter(app => app.status === 'Pending Verification'));
    setLoading(false);
  };

  const handleReview = (app) => {
    setSelectedApp(app);
    setStatus("Verified");
    setRemark("");
  };

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    // Update global applications
    const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
    const appIndex = globalApps.findIndex(a => a.id === selectedApp.id);
    
    if (appIndex > -1) {
      globalApps[appIndex].status = status;
      globalApps[appIndex].remark = remark;
      globalApps[appIndex].verified_at = new Date().toISOString();
      globalApps[appIndex].verified_by = localStorage.getItem('user') 
        ? JSON.parse(localStorage.getItem('user')).email || 'Verifying Officer'
        : 'Verifying Officer';
      localStorage.setItem('global_applications', JSON.stringify(globalApps));
    }
    
    alert(`Application ${status} successfully!`);
    setSelectedApp(null);
    fetchApplications();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Verify Applications</h1>
          <p className="text-gray-500 mt-2">Review documents and approve student scholarship applications.</p>
        </div>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-600">Application ID</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Student Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Scholarship Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Submitted On</th>
                  <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{app.id}</td>
                    <td className="px-6 py-4">{app.student_name}</td>
                    <td className="px-6 py-4">{app.scholarship_name}</td>
                    <td className="px-6 py-4">{new Date(app.submitted_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`
                        ${app.status === 'Verified' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        ${app.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                        ${app.status.includes('Flagged') ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                        ${app.status === 'Pending Verification' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''}
                      `}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleReview(app)} className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700">
                        <Eye className="w-4 h-4 mr-2" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      No applications pending verification.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog Native Modal */}
      {selectedApp !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Review Application: {selectedApp.id}</h2>
                <p className="text-gray-600 mt-1 text-sm">{selectedApp.scholarship_name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                {/* Personal Info */}
                <section>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-orange-600" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-500 block">Full Name</span><span className="font-medium">{selectedApp.personal_data?.full_name || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Email</span><span className="font-medium">{selectedApp.personal_data?.email || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Date of Birth</span><span className="font-medium">{selectedApp.personal_data?.dob || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Gender</span><span className="font-medium">{selectedApp.personal_data?.gender || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Mobile No.</span><span className="font-medium">{selectedApp.personal_data?.mobile || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Father's Name</span><span className="font-medium">{selectedApp.personal_data?.father_name || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Mother's Name</span><span className="font-medium">{selectedApp.personal_data?.mother_name || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Institute Name</span><span className="font-medium">{selectedApp.personal_data?.institution || 'N/A'}</span></div>
                    <div className="col-span-2"><span className="text-gray-500 block">Full Address</span><span className="font-medium">{selectedApp.personal_data?.address || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">State</span><span className="font-medium">{selectedApp.personal_data?.state || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">District</span><span className="font-medium">{selectedApp.personal_data?.district || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Aadhaar Card No.</span><span className="font-medium">{selectedApp.personal_data?.aadhar_no || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">APAAR ID No.</span><span className="font-medium">{selectedApp.personal_data?.apaar_id || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Category (Caste)</span><span className="font-medium">{selectedApp.personal_data?.caste || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Religion</span><span className="font-medium">{selectedApp.personal_data?.religion || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Annual Family Income</span><span className="font-medium">₹{selectedApp.personal_data?.family_income || 'N/A'}</span></div>
                    
                    <div className="col-span-2 md:col-span-3 mt-4 border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Bank Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div><span className="text-gray-500 block">Bank Name</span><span className="font-medium">{selectedApp.personal_data?.bank_name || 'N/A'}</span></div>
                        <div><span className="text-gray-500 block">Account No.</span><span className="font-medium">{selectedApp.personal_data?.account_no || 'N/A'}</span></div>
                        <div><span className="text-gray-500 block">IFSC Code</span><span className="font-medium">{selectedApp.personal_data?.ifsc_code || 'N/A'}</span></div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Educational Info */}
                <section>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> 
                    Educational Details
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border p-4 rounded-lg bg-gray-50 text-sm">
                    <div><span className="text-gray-500 block">Current Course</span><span className="font-medium">{selectedApp.education_data?.currentCourse || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Year/Class</span><span className="font-medium">{selectedApp.education_data?.currentYear || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Academic Year</span><span className="font-medium">{selectedApp.education_data?.currentAcademicYear || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block">Prev. Percentage</span><span className="font-medium">{selectedApp.education_data?.prevPercentage ? `${selectedApp.education_data.prevPercentage}%` : 'N/A'}</span></div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 font-medium">Level</th>
                          <th className="px-4 py-2 font-medium">Board/University</th>
                          <th className="px-4 py-2 font-medium">School/College</th>
                          <th className="px-4 py-2 font-medium">Passing Year</th>
                          <th className="px-4 py-2 font-medium">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedApp.education_data?.academics?.filter(a => a.applicability === 'Applicable').map((acad) => (
                          <tr key={acad.level}>
                            <td className="px-4 py-2 font-semibold uppercase">{acad.level}</td>
                            <td className="px-4 py-2">{acad.board || '-'}</td>
                            <td className="px-4 py-2">{acad.school || '-'}</td>
                            <td className="px-4 py-2">{acad.year || '-'}</td>
                            <td className="px-4 py-2">{acad.perc ? `${acad.perc}%` : '-'}</td>
                          </tr>
                        ))}
                        {(!selectedApp.education_data?.academics || selectedApp.education_data.academics.filter(a => a.applicability === 'Applicable').length === 0) && (
                          <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500">No educational details provided.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Documents */}
                <section>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" /> Uploaded Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedApp.documents && Object.entries(selectedApp.documents).map(([key, filename]) => (
                      <div key={key} className="flex justify-between items-center p-3 bg-gray-50 border rounded-md text-sm">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 truncate max-w-[120px]" title={filename}>{filename}</Badge>
                          <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => setViewingDocument({ key, filename })}>
                            <Eye className="w-3 h-3 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!selectedApp.documents || Object.keys(selectedApp.documents).length === 0) && (
                      <p className="text-gray-500 text-sm">No documents uploaded.</p>
                    )}
                  </div>
                </section>

                {/* Verification Action */}
                <section className="bg-gray-50 p-5 rounded-lg border">
                  <h3 className="text-lg font-bold mb-4">Verification Decision</h3>
                  <form onSubmit={handleSubmitVerification} className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Update Status <span className="text-red-500">*</span></label>
                      <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)} 
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Verified" className="text-green-700 font-medium">Verified (Approve)</option>
                        <option value="Flagged" className="text-orange-600 font-medium">Flagged</option>
                        <option value="Rejected" className="text-red-600 font-medium">Rejected</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Remarks / Comments <span className="text-red-500">*</span></label>
                      <textarea 
                        placeholder="Provide specific feedback or reasons..." 
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
                      <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Submit Verification</Button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col relative overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">Viewing Document</h3>
                <p className="text-sm text-gray-500">{viewingDocument.filename}</p>
              </div>
              <button onClick={() => setViewingDocument(null)} className="text-gray-500 hover:text-gray-900 bg-white rounded-full p-1 shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
              <DocumentRenderer docKey={viewingDocument.key} filename={viewingDocument.filename} studentEmail={selectedApp.student_email || selectedApp.personal_data?.email} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentRenderer({ docKey, filename, studentEmail }) {
  const [dataUrl, setDataUrl] = useState(null);
  
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const localforage = (await import('localforage')).default;
        
        let base64 = null;
        if (studentEmail) {
           const usersDbDocs = await localforage.getItem('users_db_docs') || {};
           const studentDocs = usersDbDocs[studentEmail]?.docData || {};
           const studentPhoto = usersDbDocs[studentEmail]?.photo;
           
           if (docKey === 'profilePhoto') {
             base64 = studentPhoto;
           } else {
             base64 = studentDocs[docKey];
           }
        }
        
        // Fallback to active student (if they are somehow viewing their own)
        if (!base64) {
           if (docKey === 'profilePhoto') {
             base64 = await localforage.getItem('student_profile_photo_data');
           } else {
             const docs = await localforage.getItem('student_documents_data') || {};
             base64 = docs[docKey];
           }
        }
        
        setDataUrl(base64);
      } catch (err) {
        console.error("Error loading doc", err);
      }
    };
    fetchDoc();
  }, [docKey, studentEmail]);

  if (!dataUrl) {
    return (
      <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-dashed border-gray-300">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-700">Preview Not Available</h4>
        <p className="text-gray-500 max-w-md mt-2">
          This document ({filename}) was uploaded before the Document Viewer feature was enabled, or it exceeded the storage limit.
        </p>
        <p className="text-xs text-orange-500 mt-4 font-mono">Simulated View for Hackathon Demo</p>
      </div>
    );
  }

  if (dataUrl.startsWith('data:image/')) {
    return <img src={dataUrl} alt={filename} className="max-w-full max-h-full object-contain shadow-lg" />;
  }
  
  if (dataUrl.startsWith('data:application/pdf')) {
    return <iframe src={dataUrl} className="w-full h-full border-0 shadow-lg bg-white" title={filename} />;
  }

  // Fallback for generic files
  return (
    <div className="text-center bg-white p-12 rounded-xl shadow-sm">
      <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
      <h4 className="text-lg font-medium text-gray-700">Document Uploaded Successfully</h4>
      <p className="text-gray-500 max-w-md mt-2">{filename}</p>
      <a href={dataUrl} download={filename} className="inline-block mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
        Download File
      </a>
    </div>
  );
}

// Simple internal icon
function UserIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
