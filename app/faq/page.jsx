"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "What is the Pre-Matric Scholarship for ST Students?",
      a: "It is a centrally sponsored scheme aimed at supporting the education of Scheduled Tribe (ST) students studying in classes IX and X by providing financial assistance."
    },
    {
      q: "Who is eligible to apply for these scholarships?",
      a: "Students belonging to ST, SC, OBC, or Minority communities (depending on the specific scheme) whose family income is below the prescribed limit are eligible to apply."
    },
    {
      q: "Is there an income limit for the Post-Matric Scholarship?",
      a: "Yes, for most Post-Matric scholarships, the annual family income should not exceed ₹2.5 Lakhs (or as specified by the respective state government guidelines)."
    },
    {
      q: "Can I apply for multiple scholarships at the same time?",
      a: "No, a student can apply and avail the benefits of only one government scholarship at a time. If found applying for multiple, your applications may be rejected."
    },
    {
      q: "What documents are required to apply?",
      a: "You generally need your Aadhaar Card, Income Certificate, Caste Certificate, Previous Year Marksheet, Fee Receipt, and Bank Passbook (linked with Aadhaar)."
    },
    {
      q: "How do I link my documents from DigiLocker?",
      a: "Go to your Profile's 'My Documents' section, click 'Connect to DigiLocker', authenticate yourself, and your verified documents will be fetched automatically."
    },
    {
      q: "What does 'Flagged' status mean on my application?",
      a: "A 'Flagged' status means the Verifying Officer found missing, unclear, or incorrect documents. You must log in, read the officer's remarks, and re-upload the correct documents."
    },
    {
      q: "How can I track the status of my application?",
      a: "You can track your application in real-time by clicking on the 'Application Status' tab in the left sidebar."
    },
    {
      q: "Is an Aadhaar card mandatory for the scholarship?",
      a: "Yes, an Aadhaar card is mandatory as the scholarship amount is disbursed through the Aadhaar Payment Bridge (APB) system directly into your bank account."
    },
    {
      q: "My bank account is not linked to Aadhaar. What should I do?",
      a: "You must visit your bank branch and submit an NPCI linking form along with your Aadhaar copy to seed your Aadhaar for Direct Benefit Transfer (DBT)."
    },
    {
      q: "Can I edit my application after submission?",
      a: "No, once an application is submitted, it cannot be edited unless it is 'Flagged' and sent back to you by the Verifying Officer."
    },
    {
      q: "How long does the verification process take?",
      a: "Verification is a multi-tier process (Institute Level -> District Level -> State Level). It typically takes 4-8 weeks depending on the volume of applications."
    },
    {
      q: "Who should I contact if my scholarship is delayed?",
      a: "You can reach out to your Institute's Nodal Officer or use the 'Jago Chatbot' in the portal to raise a ticket regarding your delay."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Frequently Asked Questions (FAQ)</h1>
          <p className="text-gray-500">Find answers to the most common queries about scholarships.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scholarship Help Center</CardTitle>
          <CardDescription>Click on a question to expand the answer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 bg-white"
            >
              <button
                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-gray-900">{faq.q}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-gray-700 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
