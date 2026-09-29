"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, FileText, Gift, Building2, Banknote, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Apply() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState('list');
  const [selectedSch, setSelectedSch] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [personal, setPersonal] = useState({
    full_name: '', dob: '', father_name: '', mother_name: '', institution: '', 
    state: '', district: '', aadhar_no: '', apaar_id: '', family_income: '', caste: '', religion: ''
  });

  const [education, setEducation] = useState({
    currentClass: '', prevPercentage: '', stream: ''
  });

  const [acadDetails, setAcadDetails] = useState({
    class10: { board: '', school: '', year: '', perc: '' },
    class12: { board: '', school: '', year: '', perc: '' },
    grad: { board: '', school: '', year: '', perc: '' },
    pg: { board: '', school: '', year: '', perc: '' },
  });

  const [applicability, setApplicability] = useState({ 
    class10: "Applicable", class12: "Applicable", grad: "Not Applicable", pg: "Not Applicable",
    identity: "Applicable", fatherIdentity: "Applicable", idCardBonafide: "Applicable",
    prevClassMarksheet: "Applicable", feeReceipt: "Applicable", incomeCert: "Applicable",
    casteCert: "Applicable", pwdCert: "Not Applicable", rationCard: "Not Applicable"
  });
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [appliedScholarships, setAppliedScholarships] = useState([]);
  const [indianStates, setIndianStates] = useState([]);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json")
      .then(res => res.json())
      .then(data => {
        const states = data.states.map(s => {
          if (s.state === "West Bengal") {
            return { 
              ...s, 
              districts: [
                "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", 
                "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", 
                "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", 
                "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", 
                "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", 
                "Uttar Dinajpur"
              ].sort()
            };
          }
          return s;
        });
        setIndianStates(states);
      })
      .catch(err => {
        setIndianStates([
          { state: "Maharashtra", districts: ["Mumbai", "Pune", "Nagpur"] },
          { state: "Delhi", districts: ["New Delhi", "North Delhi"] },
          { state: "Punjab", districts: ["Ludhiana", "Amritsar", "Jalandhar"] }
        ]);
      });

    const applied = JSON.parse(localStorage.getItem('student_applied_scholarships') || '[]');
    setAppliedScholarships(applied);
    const fetchScholarships = () => {
      setTimeout(() => {
        setScholarships([
          {
            id: '1', provider: 'Ministry of Tribal Affairs', name: 'Pre-Matric Scholarship for ST Students',
            description: 'Financial assistance to ST students studying in classes IX and X to reduce dropout rates and encourage transition to higher secondary education.',
            target_category: 'ST', income_limit: 250000, benefit_amount: '₹3,500 / year', deadline: '2027-10-31'
          },
          {
            id: '2', provider: 'Ministry of Tribal Affairs', name: 'Post-Matric Scholarship for ST Students',
            description: 'Supports ST students pursuing post-matriculation or post-secondary courses to enable them to complete their education.',
            target_category: 'ST', income_limit: 250000, benefit_amount: 'Fees + Maintenance', deadline: '2027-11-15'
          },
          {
            id: '3', provider: 'Ministry of Tribal Affairs', name: 'National Fellowship for Higher Education of ST Students',
            description: 'Provides financial assistance to ST students for pursuing M.Phil and Ph.D. degrees in Sciences, Humanities, and Social Sciences.',
            target_category: 'ST', income_limit: 600000, benefit_amount: '₹31,000 / month', deadline: '2027-12-31'
          }
        ]);
        setLoading(false);
      }, 500);
    };
    fetchScholarships();
  }, []);

  const fetchProfileForApplication = () => {
    const savedPersonal = localStorage.getItem('student_personal');
    if (savedPersonal) setPersonal(JSON.parse(savedPersonal));
    
    const savedApp = localStorage.getItem('student_applicability');
    let loadedApp = { ...applicability };
    if (savedApp) {
      loadedApp = JSON.parse(savedApp);
      setApplicability(loadedApp);
    }

    const savedEducation = localStorage.getItem('student_education');
    if (savedEducation) {
      const eduData = JSON.parse(savedEducation);
      setEducation({ 
        currentCourse: eduData.currentCourse || '', 
        currentYear: eduData.currentYear || '', 
        currentAcademicYear: eduData.currentAcademicYear || '',
        prevPercentage: eduData.prevPercentage || '' 
      });
      if (eduData.academics) {
        const newAcad = { ...acadDetails };
        eduData.academics.forEach(ac => {
          if (newAcad[ac.level]) {
            newAcad[ac.level] = { board: ac.board || '', school: ac.school || '', year: ac.year || '', perc: ac.perc || '' };
            loadedApp[ac.level] = ac.applicability || 'Applicable';
          }
        });
        setAcadDetails(newAcad);
        setApplicability(loadedApp);
      }
    }
    const savedDocs = localStorage.getItem('student_documents');
    if (savedDocs) setUploadedFiles(JSON.parse(savedDocs));
  };

  const handleOpenDetails = (s) => {
    setSelectedSch(s);
    setViewState('details');
  };

  const handleOpenApply = (s) => {
    setSelectedSch(s);
    fetchProfileForApplication();
    setViewState('apply');
  };

  const handleAppChange = (key, val) => {
    setApplicability(prev => ({...prev, [key]: val}));
  };

  const handleUpload = async (e, stateKey) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the 10MB limit.");
      return;
    }

    setTimeout(() => {
      alert(`Successfully uploaded ${file.name}!`);
      setUploadedFiles(prev => {
        const updated = { ...prev, [stateKey]: file.name };
        localStorage.setItem('student_documents', JSON.stringify(updated));
        return updated;
      });
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const localforage = (await import('localforage')).default;
          if (stateKey === 'profilePhoto') {
            await localforage.setItem('student_profile_photo_data', reader.result);
          }
          
          const docData = await localforage.getItem('student_documents_data') || {};
          docData[stateKey] = reader.result;
          await localforage.setItem('student_documents_data', docData);
        } catch (error) {
          console.warn("Storage quota exceeded or localforage error for document blobs. Skipping full file retention for this doc.", error);
        }
      };
      reader.readAsDataURL(file);
    }, 300);
  };

  const submitApplication = async () => {
    setIsSubmitting(true);
    try {
      // Mock saving updated profile info
      localStorage.setItem('student_personal', JSON.stringify(personal));
      
      const academics = ['class10', 'class12', 'grad', 'pg'].map(level => ({
          level, applicability: applicability[level], ...acadDetails[level]
      }));
      localStorage.setItem('student_education', JSON.stringify({ ...education, academics }));
      
      // Simulate network request
      setTimeout(() => {
        const applied = JSON.parse(localStorage.getItem('student_applied_scholarships') || '[]');
        if (!applied.includes(selectedSch.id)) {
          applied.push(selectedSch.id);
          localStorage.setItem('student_applied_scholarships', JSON.stringify(applied));
        }

        // Push full record for VO Dashboard
        const globalApps = JSON.parse(localStorage.getItem('global_applications') || '[]');
        
        // Use a consistent ID if they re-submit so we can update it, but for simplicity we mock a new ID if it doesn't exist
        const appId = 'APP-' + Math.floor(Math.random() * 1000000);
        
        // Remove existing app FOR THIS STUDENT for this scholarship if they are re-submitting
        const currentEmail = personal.email || '';
        const filteredApps = globalApps.filter(app => !(app.scholarship_id === selectedSch.id && (app.student_email === currentEmail || app.personal_data?.email === currentEmail)));
        
        const newApp = {
          id: appId,
          scholarship_id: selectedSch.id,
          scholarship_name: selectedSch.name,
          student_name: personal.full_name || 'Anonymous Student',
          student_email: personal.email || '',
          submitted_at: new Date().toISOString(),
          status: 'Pending Verification',
          remark: '',
          personal_data: personal,
          education_data: { ...education, academics },
          documents: uploadedFiles
        };
        filteredApps.push(newApp);
        localStorage.setItem('global_applications', JSON.stringify(filteredApps));

        setViewState('success');
      }, 1000);
    } catch(err) {
      console.error(err);
      alert("Error submitting application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAcademicSection = (title, stateKey) => (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Document & Section Status</Label>
          <select 
            className="w-full p-2 border rounded-md mt-1 text-sm bg-white"
            value={applicability[stateKey]}
            onChange={(e) => handleAppChange(stateKey, e.target.value)}
          >
            <option value="Applicable">Applicable</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>
        {applicability[stateKey] === "Applicable" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div><Label>Board/University</Label><Input value={acadDetails[stateKey].board} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], board: e.target.value}})} placeholder="E.g., CBSE" /></div>
            <div><Label>School/College Name</Label><Input value={acadDetails[stateKey].school} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], school: e.target.value}})} placeholder="School Name" /></div>
            <div><Label>Passing Year</Label><Input value={acadDetails[stateKey].year} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], year: e.target.value}})} placeholder="YYYY" /></div>
            <div><Label>Percentage/CGPA</Label><Input value={acadDetails[stateKey].perc} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], perc: e.target.value}})} placeholder="E.g., 85%" /></div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (viewState === 'success') {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="bg-white/80 backdrop-blur-xl border border-green-100 p-12 rounded-3xl shadow-xl max-w-xl mx-auto">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Application Submitted!</h1>
          <p className="text-gray-600 mb-8 text-lg">Your scholarship application for <b>{selectedSch?.name}</b> has been successfully routed to the verification layer using your profile's data and documents.</p>
          <Link href="/status">
            <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6 rounded-xl">Track Status</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (viewState === 'details') {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6 max-w-4xl">
        <Button variant="ghost" onClick={() => setViewState('list')} className="mb-6 text-gray-500 hover:text-red-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Scholarships
        </Button>
        <Card className="border-none bg-white/90 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500"></div>
          <CardHeader className="pt-8">
            <CardDescription className="flex items-center gap-2 text-red-600 font-bold mb-2 uppercase tracking-wider">
              <Building2 className="h-5 w-5" /> {selectedSch.provider}
            </CardDescription>
            <CardTitle className="text-3xl text-gray-900">{selectedSch.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-lg font-bold border-b pb-2 mb-4">About this Scheme</h3>
              <p className="text-gray-700 leading-relaxed text-lg">{selectedSch.description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-2xl">
                <h4 className="font-bold text-red-900 mb-2">Eligibility Criteria</h4>
                <ul className="space-y-2 text-red-800">
                  <li>• Target Category: <b>{selectedSch.target_category}</b></li>
                  <li>• Maximum Family Income: <b>₹{selectedSch.income_limit} / year</b></li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-2xl">
                <h4 className="font-bold text-orange-900 mb-2">Financial Benefits</h4>
                <p className="text-orange-800 text-xl font-bold">{selectedSch.benefit_amount}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between items-center p-6 border-t">
             <div className="text-gray-500 font-medium flex items-center gap-2">
               <Clock className="h-5 w-5" /> Deadline: {new Date(selectedSch.deadline).toLocaleDateString()}
             </div>
             <Button 
               onClick={() => !appliedScholarships.includes(selectedSch.id) && handleOpenApply(selectedSch)} 
               disabled={appliedScholarships.includes(selectedSch.id)}
               className={`${appliedScholarships.includes(selectedSch.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white px-8 py-6 text-lg rounded-xl shadow-lg`}
             >
               {appliedScholarships.includes(selectedSch.id) ? 'Already Applied' : <span className="flex items-center">Proceed to Apply <ArrowRight className="ml-2 h-5 w-5" /></span>}
             </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (viewState === 'apply') {
    return (
      <div className="container mx-auto py-10 px-4 md:px-6">
        <Button variant="ghost" onClick={() => setViewState('details')} className="mb-6 text-gray-500 hover:text-red-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
        </Button>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Application Form: {selectedSch?.name}</h1>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="documents">My Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div><Label>Full Name</Label><Input value={personal.full_name} onChange={e=>setPersonal({...personal, full_name: e.target.value})} placeholder="John Doe" /></div>
                  <div><Label>Email</Label><Input type="email" value={personal.email} onChange={e=>setPersonal({...personal, email: e.target.value})} placeholder="student@example.com" /></div>
                  <div><Label>Date of Birth</Label><Input type="date" value={personal.dob} onChange={e=>setPersonal({...personal, dob: e.target.value})} /></div>
                  <div>
                    <Label>Gender</Label>
                    <select 
                      className="w-full border border-gray-300 rounded-md p-2 text-sm bg-transparent mt-1" 
                      value={personal.gender || ''} 
                      onChange={e=>setPersonal({...personal, gender: e.target.value})}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div><Label>Mobile No.</Label><Input type="tel" value={personal.mobile} onChange={e=>setPersonal({...personal, mobile: e.target.value})} placeholder="10-digit number" /></div>
                  <div><Label>Father's Name</Label><Input value={personal.father_name} onChange={e=>setPersonal({...personal, father_name: e.target.value})} placeholder="Father Name" /></div>
                  <div><Label>Mother's Name</Label><Input value={personal.mother_name} onChange={e=>setPersonal({...personal, mother_name: e.target.value})} placeholder="Mother Name" /></div>
                  <div><Label>Institute Name</Label><Input value={personal.institution} onChange={e=>setPersonal({...personal, institution: e.target.value})} placeholder="Current Institute" /></div>
                  <div><Label>Full Address</Label><Input value={personal.address} onChange={e=>setPersonal({...personal, address: e.target.value})} placeholder="Street Address" /></div>
                  <div>
                    <Label>State</Label>
                    <select 
                      className="w-full border border-gray-300 rounded-md p-2 text-sm bg-transparent mt-1" 
                      value={personal.state || ''} 
                      onChange={e=>setPersonal({...personal, state: e.target.value, district: ''})}
                    >
                      <option value="">Select State</option>
                      {indianStates.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>District</Label>
                    <select 
                      className="w-full border border-gray-300 rounded-md p-2 text-sm bg-transparent mt-1" 
                      value={personal.district || ''} 
                      onChange={e=>setPersonal({...personal, district: e.target.value})}
                    >
                      <option value="">Select District</option>
                      {indianStates.find(s => s.state === personal.state)?.districts?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div><Label>Aadhaar Card No</Label><Input value={personal.aadhar_no} onChange={e=>setPersonal({...personal, aadhar_no: e.target.value})} placeholder="XXXX XXXX XXXX" /></div>
                  <div><Label>APAAR ID No</Label><Input value={personal.apaar_id} onChange={e=>setPersonal({...personal, apaar_id: e.target.value})} placeholder="Enter APAAR ID" /></div>
                  <div><Label>Family Income (Annual)</Label><Input type="number" value={personal.family_income} onChange={e=>setPersonal({...personal, family_income: e.target.value})} placeholder="?" /></div>
                  <div><Label>Caste Category</Label><Input value={personal.caste} onChange={e=>setPersonal({...personal, caste: e.target.value})} placeholder="E.g., ST, SC, OBC, General" /></div>
                  <div><Label>Religion</Label><Input value={personal.religion} onChange={e=>setPersonal({...personal, religion: e.target.value})} placeholder="Religion" /></div>
                  
                  {/* Bank Details */}
                  <div><Label>Bank Name</Label><Input value={personal.bank_name || ''} onChange={e=>setPersonal({...personal, bank_name: e.target.value})} placeholder="E.g., State Bank of India" /></div>
                  <div><Label>Account Number</Label><Input value={personal.account_no || ''} onChange={e=>setPersonal({...personal, account_no: e.target.value})} placeholder="Account Number" /></div>
                  <div><Label>IFSC Code</Label><Input value={personal.ifsc_code || ''} onChange={e=>setPersonal({...personal, ifsc_code: e.target.value})} placeholder="Bank IFSC Code" /></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Current Academic Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><Label>Current Course</Label><Input value={education.currentCourse || ''} onChange={e=>setEducation({...education, currentCourse: e.target.value})} placeholder="E.g., B.Tech, B.Sc" /></div>
                    <div><Label>Current Year/Class</Label><Input value={education.currentYear || ''} onChange={e=>setEducation({...education, currentYear: e.target.value})} placeholder="E.g., 2nd Year, Class 11" /></div>
                    <div><Label>Current Academic Year</Label><Input value={education.currentAcademicYear || ''} onChange={e=>setEducation({...education, currentAcademicYear: e.target.value})} placeholder="E.g., 2023-2024" /></div>
                    <div><Label>Previous Class Percentage</Label><Input value={education.prevPercentage || ''} onChange={e=>setEducation({...education, prevPercentage: e.target.value})} placeholder="E.g., 85%" /></div>
                  </div>
                </CardContent>
              </Card>

              {renderAcademicSection("Class 10 (Matriculation)", "class10")}
              {renderAcademicSection("Class 12 (Intermediate)", "class12")}
              {renderAcademicSection("UG / Graduation", "grad")}
              {renderAcademicSection("PG / Post Graduation", "pg")}
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Documents</CardTitle>
                  <CardDescription>Centralized Document Management System</CardDescription>
                </div>
                <Button variant="outline" className="flex items-center gap-2 border-blue-600 text-blue-700 hover:bg-blue-50" onClick={() => window.open('https://www.digilocker.gov.in/', '_blank')}>
                  <img src="/assets/digilocker.svg" alt="DigiLocker" className="w-5 h-5 object-contain" />
                  Connect to DigiLocker
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                  {[
                    { name: 'Profile Photo (Passport Size)', type: 'Identity', stateKey: 'profilePhoto', isMandatory: true },
                    { name: 'Student Identity (Aadhaar/PAN/Voter)', type: 'Identity', stateKey: 'identity', isMandatory: true },
                    { name: "Father's Identity (Aadhaar/PAN/Voter)", type: 'Identity', stateKey: 'fatherIdentity', isMandatory: true },
                    { name: 'ID Card / Bonafide', type: 'Identity', stateKey: 'idCardBonafide', isMandatory: true },
                    { name: 'Previous Class Marksheet', type: 'Academic', stateKey: 'prevClassMarksheet', isMandatory: true },
                    { name: 'Fee Receipt', type: 'Financial', stateKey: 'feeReceipt', isMandatory: true },
                    { name: 'Income Certificate', type: 'Financial', stateKey: 'incomeCert', isMandatory: true },
                    { name: 'Class 10 Marksheet', type: 'Academic', stateKey: 'class10' },
                    { name: 'Class 12 Marksheet', type: 'Academic', stateKey: 'class12' },
                    { name: 'UG / Graduation Marksheet', type: 'Academic', stateKey: 'grad' },
                    { name: 'PG / Post Graduation Marksheet', type: 'Academic', stateKey: 'pg' },
                    { name: 'Caste Certificate', type: 'Other', stateKey: 'casteCert' },
                    { name: 'PWD Certificate', type: 'Other', stateKey: 'pwdCert' },
                    { name: 'Ration Card', type: 'Other', stateKey: 'rationCard' }
                  ].map((doc, idx) => {
                    const isReq = doc.isMandatory || applicability[doc.stateKey] === "Applicable";
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{doc.type}</p>
                        </div>
                        <div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3">
                              {doc.isMandatory ? (
                                <span className="text-xs font-bold text-gray-800 bg-gray-200 px-2 py-1.5 rounded uppercase tracking-wider">Required</span>
                              ) : (
                                <select 
                                  className="text-xs font-medium p-1.5 border rounded bg-white text-gray-700"
                                  value={isReq ? "req" : "not_req"}
                                  onChange={(e) => handleAppChange(doc.stateKey, e.target.value === "req" ? "Applicable" : "Not Applicable")}
                                >
                                  <option value="req">Applicable</option>
                                  <option value="not_req">Not Applicable</option>
                                </select>
                              )}

                              {isReq ? (
                                <div className="relative">
                                  <Input 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => handleUpload(e, doc.stateKey)}
                                    required={isReq}
                                  />
                                  <Button variant="default" size="sm" className="pointer-events-none w-[100px]">
                                    {uploadedFiles[doc.stateKey] ? "Change File" : "Upload"}
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="outline" size="sm" disabled className="w-[100px] bg-gray-100 text-gray-400 border-dashed">
                                  N/A
                                </Button>
                              )}
                            </div>
                            {uploadedFiles[doc.stateKey] && <span className="text-xs text-green-600 font-bold">Uploaded: {uploadedFiles[doc.stateKey]}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-white/80 backdrop-blur-xl border-none shadow-lg">
          <CardHeader><CardTitle>Declaration</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              I hereby declare that the information provided above and the documents attached are true and correct. By clicking Confirm & Submit, my manually edited fields will be saved to my profile, and my application will be sent for verification.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={submitApplication} 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:shadow-lg hover:shadow-red-500/30 text-white font-bold py-6 text-lg rounded-xl"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm & Submit Application'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">Unified Scholarship Portal</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Access and apply to all Ministry of Tribal Affairs (MoTA) scholarship schemes through this single, unified interface.
        </p>
      </div>
      
      {loading ? (
        <p className="text-center text-gray-500 text-xl py-20">Loading available schemes...</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {scholarships.map((s) => {
            const isApplied = appliedScholarships.includes(s.id);
            return (
            <Card key={s.id} className="hover:shadow-2xl transition-all border-none bg-white/90 backdrop-blur-xl group overflow-hidden relative flex flex-col">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-600 to-orange-500"></div>
              <CardHeader className="pl-8 pt-8">
                <CardDescription className="flex items-center gap-2 text-red-600 font-semibold mb-2 tracking-wide uppercase text-sm">
                  <Building2 className="h-4 w-4" /> {s.provider}
                </CardDescription>
                <CardTitle className="text-2xl text-gray-900 leading-tight group-hover:text-red-700 transition-colors">
                  {s.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-8 pb-6 flex-1">
                <p className="text-gray-600 mb-6 text-base leading-relaxed line-clamp-3">
                  {s.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <p className="text-xs text-red-800 flex items-center gap-1 font-medium mb-1"><Banknote className="h-3 w-3"/> Benefit Amount</p>
                    <p className="font-bold text-gray-900 text-sm">{s.benefit_amount}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-800 flex items-center gap-1 font-medium mb-1"><CheckCircle2 className="h-3 w-3"/> Target Income</p>
                    <p className="font-bold text-gray-900 text-sm">&lt; ₹{(s.income_limit/100000).toFixed(1)} Lakhs</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pl-8 bg-gray-50/50 py-4 border-t flex justify-between items-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => handleOpenDetails(s)}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold py-5 rounded-xl transition-all"
                >
                  View Details
                </Button>
                <Button 
                  onClick={() => !isApplied && handleOpenApply(s)}
                  disabled={isApplied}
                  className={`flex-1 ${isApplied ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-orange-500 hover:shadow-red-500/30'} text-white rounded-xl shadow-lg font-bold py-5 transition-all`}
                >
                  {isApplied ? 'Already Applied' : <span className="flex items-center">Apply <ArrowRight className="ml-2 h-4 w-4" /></span>}
                </Button>
              </CardFooter>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
}