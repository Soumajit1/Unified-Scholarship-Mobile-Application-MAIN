"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, FileText, Gift, Clock, User, MessageSquare, ArrowRight, Building2, MapPin, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [dbStats, setDbStats] = useState({
    profileCompletion: 20,
    eligibleScholarships: 0,
    activeApplications: 0,
    pendingVerification: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/student/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        console.error(e);
      }
    };
    
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/student/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setDbStats(data);
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchProfile();
    fetchStats();
  }, []);

  const stats = [
    { title: "Profile Completion", value: `${dbStats.profileCompletion}%`, icon: CheckCircle2, color: "text-red-500" },
    { title: "Eligible Scholarships", value: dbStats.eligibleScholarships, icon: Gift, color: "text-orange-500" },
    { title: "Active Applications", value: dbStats.activeApplications, icon: FileText, color: "text-red-600" },
    { title: "Pending Verification", value: dbStats.pendingVerification, icon: Clock, color: "text-orange-600" },
  ];

  const actions = [
    { title: "Application Status", desc: "Track the progress of your submitted applications", icon: FileText, link: "/status", color: "bg-amber-50 text-amber-600" },
    { title: "AI Chat Support", desc: "Get instant help from our AI Assistant", icon: MessageSquare, link: "/chat", color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="container mx-auto py-2 px-2 md:py-6 md:px-4">
      {/* User Header Profile */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center gap-6">
        <div className="h-20 w-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl font-bold">
          {profile?.personal?.full_name ? profile.personal.full_name.charAt(0) : <User />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {profile?.personal?.full_name || 'Student'}!</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {profile?.personal?.email && (
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {profile.personal.email}</span>
            )}
            {profile?.personal?.institution && (
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" /> {profile.personal.institution}</span>
            )}
            {profile?.personal?.state && (
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.personal.state}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Registration Details Overview */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Registration Details</h2>
      <Card className="mb-10 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-semibold text-lg text-gray-900">{profile?.personal?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-semibold text-lg text-gray-900">{profile?.personal?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Institution Name</p>
                <p className="font-semibold text-lg text-gray-900">{profile?.personal?.institution || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">State</p>
                <p className="font-semibold text-lg text-gray-900">{profile?.personal?.state || 'N/A'}</p>
              </div>
           </div>
        </CardContent>
      </Card>

      {/* Quick Actions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="hover:border-red-300 hover:shadow-lg transition-all cursor-pointer group">
              <Link href={action.link}>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${action.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-gray-500">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-300 group-hover:text-red-500 transition-colors" />
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
      
      {/* Extra Dashboard Elements */}
      <div className="mt-10 max-w-3xl mx-auto">
        <Card className="bg-gradient-to-br from-red-600 to-orange-500 text-white border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Need Help?</CardTitle>
            <CardDescription className="text-red-100 text-lg">Talk to our intelligent assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-red-50 text-lg">Not sure which scholarships you qualify for or what documents are missing? Our AI agent can read your profile and guide you step-by-step.</p>
            <Link href="/chat">
              <Button className="w-full bg-white text-red-600 hover:bg-gray-100 font-bold py-6 text-xl rounded-xl shadow-md transition-transform hover:scale-[1.02]">
                <MessageSquare className="mr-2 h-6 w-6" /> Start AI Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}