"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle } from "lucide-react";

export default function Status() {
  const [applications, setApplications] = useState([]);
  const [rejectedDocs, setRejectedDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = () => {
      setTimeout(() => {
        const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
        const personal = JSON.parse(localStorage.getItem('student_personal') || '{}');
        const currentEmail = personal.email || '';

        // Only show apps belonging to the currently logged-in student
        const myApps = globalApps.filter(app =>
          (app.personal_data?.email && app.personal_data.email === currentEmail) ||
          app.student_email === currentEmail
        );

        setApplications(myApps);
        setLoading(false);
      }, 300);
    };
    fetchApps();
  }, []);

  const generatePdfContent = (doc, autoTable, app, profileData, startY) => {
    doc.setFontSize(11);
    doc.text(`Application ID: ${app.id}`, 14, startY);
    doc.text(`Scholarship: ${app.scholarship_name}`, 14, startY + 8);
    doc.text(`Status: ${app.status}`, 14, startY + 16);
    doc.text(`Submitted On: ${new Date(app.submitted_at).toLocaleDateString()}`, 14, startY + 24);

    autoTable(doc, {
      startY: startY + 32,
      head: [["Personal Information", ""]],
      body: [
        ["Full Name", profileData.personal?.full_name || "N/A"],
        ["DOB", profileData.personal?.dob || "N/A"],
        ["Aadhar No", profileData.personal?.aadhar_no || "N/A"],
        ["Category", profileData.personal?.caste || "N/A"],
        ["Institution", profileData.personal?.institution || "N/A"],
        ["State", profileData.personal?.state || "N/A"],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    });

    let finalY = doc.lastAutoTable?.finalY || startY + 32;

    const eduBody = (profileData.education?.academics || []).map((ed) => [
      ed.level,
      ed.institution_name || ed.board_university || "N/A",
      ed.percentage || "N/A",
      ed.passing_year || "N/A",
    ]);

    if (eduBody.length > 0) {
      autoTable(doc, {
        startY: finalY + 10,
        head: [["Education Level", "Board/Institution", "Percentage", "Year"]],
        body: eduBody,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });
      finalY = doc.lastAutoTable?.finalY || finalY + 10;
    }

    const docBody = (profileData.documents || []).map((d) => [d.doc_type, d.status]);
    if (docBody.length > 0) {
      autoTable(doc, {
        startY: finalY + 10,
        head: [["Document Type", "Verification Status"]],
        body: docBody,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    doc.save(`Application_${app.application_id}.pdf`);
  };

  const handleDownloadPdf = async (app) => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const savedPersonal = localStorage.getItem("student_personal");
      const savedEducation = localStorage.getItem("student_education");
      const savedDocs = localStorage.getItem("student_documents");
      
      const profileData = {
        personal: savedPersonal ? JSON.parse(savedPersonal) : {},
        education: savedEducation ? JSON.parse(savedEducation) : {},
        documents: savedDocs ? Object.keys(JSON.parse(savedDocs)).map(k => ({ doc_type: k, status: "UPLOADED" })) : []
      };

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Government of India", 105, 20, { align: "center" });
      doc.text("Ministry of Education", 105, 28, { align: "center" });
      doc.setFontSize(12);
      doc.text("Scholarship Application Form", 105, 36, { align: "center" });

      // Generate the text content immediately (fallbacks for logos if they fail)
      const renderContent = (startY) => {
         generatePdfContent(doc, autoTable, app, profileData, startY);
      };

      const loadImg = (src, isSvg = false) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (isSvg) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width || 200;
              canvas.height = img.height || 200;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve(img);
            }
          };
          img.onerror = () => resolve(null);
          img.src = src;
        });
      };
      
      const emblemImg = await loadImg('/assets/emblem.svg', true);
      
      let profilePhotoDataUrl = null;
      try {
         const localforage = (await import('localforage')).default;
         profilePhotoDataUrl = await localforage.getItem('student_profile_photo_data');
      } catch(e) {}
      
      let profileImg = null;
      if (profilePhotoDataUrl) {
         profileImg = await loadImg(profilePhotoDataUrl, false);
      }

      if (emblemImg) {
        doc.addImage(emblemImg, "PNG", 20, 10, 25, 25);
      } else {
        doc.setFontSize(10);
        doc.text("[Ashok Stambha]", 20, 20);
      }

      if (profilePhotoDataUrl) {
        // Draw the applicant's profile photo on the top right using base64 directly
        const format = profilePhotoDataUrl.toLowerCase().includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(profilePhotoDataUrl, format, 165, 10, 25, 30);
      } else {
        doc.setFontSize(10);
        doc.rect(165, 10, 25, 30); // Draw a border frame
        doc.text("Photo", 172, 25);
      }
      
      renderContent(45);
      
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. See console for details.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Application Status</h1>

      {loading ? (
        <p className="text-gray-500">Loading your applications...</p>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-gray-500">
            <p className="text-lg">You have not submitted any applications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((app) => (
            <Card key={app.application_id || app.id}>
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-2 gap-4">
                <div>
                  <CardTitle>{app.scholarship_name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Application ID: {app.id}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    className={`text-sm ${
                      app.status === "Finance Review"
                        ? "bg-green-100 text-green-800"
                        : app.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : app.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : app.status.includes("Flagged")
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {app.status}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPdf(app)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm mt-4">
                  <div>
                    <span className="text-muted-foreground block">Submitted On</span>
                    <span className="font-medium">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 border rounded-md">
                  <h4 className="font-semibold text-sm mb-1">Latest Remark from Officer:</h4>
                  <p className="text-sm text-muted-foreground">
                    {app.remark || "Your application is pending review. No remarks yet."}
                  </p>
                </div>

                {app.status.includes('Flagged') && (
                  <div className="mt-4 p-4 border border-orange-200 bg-orange-50 rounded-md">
                    <h4 className="font-semibold text-orange-800 mb-2">
                      Action Required: Upload Missing Documents
                    </h4>

                    {rejectedDocs.length > 0 ? (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm font-medium">
                        <p className="mb-1 font-bold">The following documents were rejected:</p>
                        <ul className="list-disc pl-5">
                          {rejectedDocs.map((doc, idx) => (
                            <li key={idx} className="capitalize">
                              {doc.doc_type.replace(/_/g, " ")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-orange-700 mb-4">
                        Please read the officer's remark above and upload the requested document(s) to
                        proceed with your application.
                      </p>
                    )}

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const token = localStorage.getItem("token");
                        const fileInput = e.target.elements.document;
                        if (!fileInput.files[0]) return alert("Select a file first.");

                        const formData = new FormData();
                        formData.append("document", fileInput.files[0]);
                        formData.append(
                          "document_type",
                          rejectedDocs.length > 0 ? rejectedDocs[0].doc_type : "supplementary"
                        );

                          try {
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64Data = reader.result;
                              const docType = rejectedDocs.length > 0 ? rejectedDocs[0].doc_type : "supplementary";
                              
                              try {
                                const localforage = (await import('localforage')).default;
                                const email = app.student_email || app.personal_data?.email;
                                if (email) {
                                  const usersDbDocs = await localforage.getItem('users_db_docs') || {};
                                  if (!usersDbDocs[email]) usersDbDocs[email] = { docData: {} };
                                  usersDbDocs[email].docData[docType] = base64Data;
                                  await localforage.setItem('users_db_docs', usersDbDocs);
                                }
                              } catch(e) { console.error("Error saving doc directly to users_db_docs", e); }
                              
                              // Save to global_applications
                              const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
                              const appIndex = globalApps.findIndex(a => a.id === app.id);
                              
                              if (appIndex > -1) {
                                if (!globalApps[appIndex].documents) globalApps[appIndex].documents = {};
                                globalApps[appIndex].documents[docType] = fileInput.files[0].name;
                                globalApps[appIndex].status = "Pending Verification";
                                globalApps[appIndex].remark = "Document uploaded. Waiting for officer review.";
                                localStorage.setItem('global_applications', JSON.stringify(globalApps));
                              }
                              
                              alert("Document uploaded and application resubmitted for verification!");
                              window.location.reload();
                            };
                            reader.readAsDataURL(fileInput.files[0]);
                          } catch (err) {
                            console.error(err);
                            alert("An error occurred while uploading.");
                          }
                        }}
                    >
                      <div className="flex gap-2">
                        <input
                          type="file"
                          name="document"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        />
                        <Button
                          type="submit"
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Upload & Resubmit
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}