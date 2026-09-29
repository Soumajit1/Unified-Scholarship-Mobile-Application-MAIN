"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, XCircle, Eye } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Assuming you have a Textarea component for the remark
import { Textarea } from "@/components/ui/textarea"; 

export default function ReviewApplication() {
  const router = useRouter();
  const params = useParams();
  const appId = params?.appId; // Assumes your dynamic route is [appId]

  const [selectedApp, setSelectedApp] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("Approved");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appId) {
      handleReview();
    }
  }, [appId]);

  const handleReview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return router.push("/");

      // Fetch Application Details
      const res = await fetch(`http://localhost:5000/api/officer/application/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setSelectedApp(data);
        setStatus("Approved");
        setRemark("");
      }

      // Fetch Application History
      const histRes = await fetch(`http://localhost:5000/api/officer/application/${appId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }
    } catch (err) {
      console.error("Failed to load application data:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async (docId, docStatus) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/officer/verify_document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ document_id: docId, status: docStatus }),
      });
      
      handleReview(); // Refresh the data to show updated document status
    } catch (err) {
      console.error("Failed to verify document:", err);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/officer/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          application_id: appId,
          status,
          remark,
        }),
      });
      
      handleReview(); // Refresh data instead of redirecting so they see the history update
    } catch (err) {
      console.error("Failed to submit verification:", err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading application details...</div>;
  if (!selectedApp) return <div className="p-8 text-center text-red-500">Application not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/officer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Review Application</h1>
          <p className="text-gray-500 mt-1">
            {selectedApp.application_id} - {selectedApp.scholarship_name}
          </p>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Student Profile</CardTitle>
          <CardDescription>Personal and academic details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
            <div>
              <span className="text-gray-500 block mb-1">Full Name</span>
              <span className="font-medium text-base">{selectedApp.profile.full_name}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Annual Income</span>
              <span className="font-medium text-base">₹{selectedApp.profile.annual_income}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Category</span>
              <span className="font-medium text-base">{selectedApp.profile.category}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-1">Aadhaar Number</span>
              <span className="font-medium text-base">{selectedApp.profile.aadhar_no}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>Review and verify all uploaded proofs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedApp.documents.length === 0 && (
              <p className="text-sm text-gray-500">No documents uploaded.</p>
            )}
            
            {selectedApp.documents.map((doc) => (
              <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-gray-50 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900">{doc.document_name || "Document"}</h3>
                    <Badge variant="outline" className={`mt-1 ${
                      doc.verification_status === 'VERIFIED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      doc.verification_status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {doc.verification_status || 'Pending'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`http://localhost:5000${doc.file_path.startsWith('/') ? '' : '/'}${doc.file_path}`} target="_blank" rel="noreferrer">
                      <Eye className="w-4 h-4 mr-2" /> View File
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => verifyDocument(doc.id, 'VERIFIED')}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => verifyDocument(doc.id, 'REJECTED')}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {history && history.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
            <CardDescription>Previous actions taken on this application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((hist, idx) => (
                <div key={idx} className="border-l-2 border-red-500 pl-4 py-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">{hist.action}</span>
                    <span className="text-xs text-gray-500">{new Date(hist.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{hist.remark}</p>
                  <p className="text-xs text-gray-500">By Officer: {hist.officer_name || 'System'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white border-t-4 border-t-red-600">
        <CardHeader>
          <CardTitle>Final Verification Action</CardTitle>
          <CardDescription>Submit your decision on this application</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify}>
            <div className="space-y-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md border">
                    <SelectItem value="Approved">Approve (Send to Finance)</SelectItem>
                    <SelectItem value="Documents Required">Flag: Documents Required</SelectItem>
                    <SelectItem value="Rejected">Reject Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Remarks</label>
                <Textarea 
                  placeholder="Enter any notes or reasons for rejection..." 
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                Submit Verification Decision
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}