"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../globals.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institution: "",
    course: "",
    state: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const normalizedEmail = formData.email.toLowerCase().trim();
    
    // Save current active student to users_db before wiping
    let activePersonal = {};
    try { activePersonal = JSON.parse(localStorage.getItem('student_personal') || '{}'); } catch(e) {}
    
    if (activePersonal.email) {
       const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');
       usersDb[activePersonal.email] = {
          personal: localStorage.getItem('student_personal'),
          education: localStorage.getItem('student_education'),
          documents: localStorage.getItem('student_documents'),
          applied: localStorage.getItem('student_applied_scholarships'),
          role: 'STUDENT',
          status: usersDb[activePersonal.email]?.status || 'ACTIVE'
       };
       localStorage.setItem('users_db', JSON.stringify(usersDb));
       
       try {
          const localforage = (await import('localforage')).default;
          const usersDbDocs = await localforage.getItem('users_db_docs') || {};
          usersDbDocs[activePersonal.email] = {
             photo: await localforage.getItem('student_profile_photo_data'),
             docData: await localforage.getItem('student_documents_data')
          };
          await localforage.setItem('users_db_docs', usersDbDocs);
       } catch(err) { console.error(err); }
    }

    // Clear out active student mock data so the new user gets a fresh profile
    localStorage.removeItem("student_personal");
    localStorage.removeItem("student_education");
    localStorage.removeItem("student_documents");
    localStorage.removeItem("student_applied_scholarships");
    
    try {
       const localforage = (await import('localforage')).default;
       await localforage.removeItem("student_profile_photo_data");
       await localforage.removeItem("student_documents_data");
    } catch(err) { console.error(err); }

    // Initialize personal data with the registered full name
    localStorage.setItem("student_personal", JSON.stringify({
      full_name: formData.fullName,
      email: normalizedEmail,
      institution: formData.institution,
      state: formData.state
    }));

    localStorage.setItem("user", JSON.stringify({ ...formData, email: normalizedEmail }));
    localStorage.setItem("role", "STUDENT"); // Registration is only for students
    localStorage.setItem("token", "mock-jwt-token");
    
    // Redirect to student profile/dashboard
    router.push("/profile");
  };

  return (
    <AuthLayout>
      <Card className="border-0 shadow-lg rounded-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
          <CardDescription className="text-gray-500">
            Please fill in your details to register as a student.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Used for Login)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johndoe@example.com"
                required
                className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution Name</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={handleChange}
                placeholder="ABC College"
                required
                className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Current Course</Label>
                <Input
                  id="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="B.Tech CSE"
                  required
                  className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  required
                  className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
              />
            </div>
            
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white mt-4">
              Register <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-red-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
