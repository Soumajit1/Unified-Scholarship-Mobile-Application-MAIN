"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const [personal, setPersonal] = useState({
    full_name: '', dob: '', father_name: '', mother_name: '', institution: '', 
    state: '', district: '', aadhar_no: '', apaar_id: '', family_income: '', caste: '', religion: '',
    bank_name: '', account_no: '', ifsc_code: ''
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

  const [identity, setIdentity] = useState({
    enrollment_id: '', guardian_name: '', guardian_id: ''
  });

  const [applicability, setApplicability] = useState({ 
    class10: "Applicable", 
    class12: "Applicable", 
    grad: "Not Applicable",
    pg: "Not Applicable",
    identity: "Applicable",
    fatherIdentity: "Applicable",
    idCardBonafide: "Applicable",
    prevClassMarksheet: "Applicable",
    feeReceipt: "Applicable",
    incomeCert: "Applicable",
    casteCert: "Applicable",
    pwdCert: "Not Applicable",
    rationCard: "Not Applicable"
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
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
  }, []);

  const handleAppChange = (key, val) => {
    setApplicability(prev => ({...prev, [key]: val}));
  };

  const saveDocuments = () => {
    localStorage.setItem('student_documents', JSON.stringify(uploadedFiles));
    localStorage.setItem('student_applicability', JSON.stringify(applicability));
    setTimeout(() => alert('Documents and requirements saved successfully!'), 300);
  };

  const savePersonal = async () => {
    try {
      // Mock saving to backend
      localStorage.setItem('student_personal', JSON.stringify(personal));
      setTimeout(() => alert('Personal details saved successfully!'), 300);
    } catch(e) { console.error(e); }
  };

  const saveEducation = async () => {
    const academics = ['class10', 'class12', 'grad', 'pg'].map(level => ({
        level,
        applicability: applicability[level],
        ...acadDetails[level]
    }));
    try {
      // Mock saving to backend
      localStorage.setItem('student_education', JSON.stringify({ ...education, academics }));
      setTimeout(() => alert('Education details saved successfully!'), 300);
    } catch(e) { console.error(e); }
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
          
          // Immediate backup to isolated user storage to guarantee availability for Admin/VO
          const email = personal.email;
          if (email) {
            const usersDbDocs = await localforage.getItem('users_db_docs') || {};
            if (!usersDbDocs[email]) usersDbDocs[email] = { docData: {} };
            if (stateKey === 'profilePhoto') {
              usersDbDocs[email].photo = reader.result;
            } else {
              usersDbDocs[email].docData[stateKey] = reader.result;
            }
            await localforage.setItem('users_db_docs', usersDbDocs);
          }
        } catch (error) {
          console.warn("Storage quota exceeded or localforage error for document blobs. Skipping full file retention for this doc.", error);
        }
      };
      reader.readAsDataURL(file);
    }, 300);
  };

  const renderAcademicSection = (title, stateKey) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-lg">
          {title}
          <select 
            className="text-sm font-normal p-1.5 border rounded-md"
            value={applicability[stateKey]} 
            onChange={(e) => handleAppChange(stateKey, e.target.value)}
          >
            <option value="Applicable">Applicable</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </CardTitle>
      </CardHeader>
      {applicability[stateKey] === "Applicable" && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Board/University</Label>
              <Input value={acadDetails[stateKey].board} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], board: e.target.value}})} placeholder="Board" />
            </div>
            <div>
              <Label>School/College</Label>
              <Input value={acadDetails[stateKey].school} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], school: e.target.value}})} placeholder="School" />
            </div>
            <div>
              <Label>Passing Year</Label>
              <Input value={acadDetails[stateKey].year} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], year: e.target.value}})} placeholder="Year" />
            </div>
            <div>
              <Label>Percentage/CGPA</Label>
              <Input value={acadDetails[stateKey].perc} onChange={e => setAcadDetails({...acadDetails, [stateKey]: {...acadDetails[stateKey], perc: e.target.value}})} placeholder="%" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  // Extracted document list for clean mapping
  const documentRequirements = [
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
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Update Profile</h1>
      
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
              <div className="mt-4">
                <Button onClick={savePersonal}>Save Personal Details</Button>
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
            
            <div className="mt-4">
              <Button onClick={saveEducation}>Save Education Details</Button>
            </div>
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
                {documentRequirements.map((doc, idx) => {
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
              <div className="mt-6 border-t pt-4 flex justify-end">
                <Button onClick={saveDocuments} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg">
                  Save All Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}