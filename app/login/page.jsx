"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../globals.css";
import { MoveRight } from "lucide-react";

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
import AuthLayout from "@/components/AuthLayout";

export default function Page() {
  const router = useRouter();
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // CAPTCHA State
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (parseInt(captchaAnswer) !== captchaNum1 + captchaNum2) {
      alert("Invalid CAPTCHA answer. Please try again.");
      setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
      setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
      setCaptchaAnswer("");
      return;
    }

    if (role === "SYSTEM_ADMIN") {
      if (email !== "admin@gov.in" || password !== "Admin@123") {
        alert("Invalid System Admin credentials. Access Denied.");
        return;
      }
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (role === "STUDENT") {
      let activePersonal = {};
      try { activePersonal = JSON.parse(localStorage.getItem('student_personal') || '{}'); } catch(e) {}
      
      if (activePersonal.email !== normalizedEmail) {
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
        
        const usersDb = JSON.parse(localStorage.getItem('users_db') || '{}');
        const nextUser = usersDb[normalizedEmail];
        
        if (nextUser) {
          if(nextUser.personal) localStorage.setItem('student_personal', nextUser.personal); else localStorage.removeItem('student_personal');
          if(nextUser.education) localStorage.setItem('student_education', nextUser.education); else localStorage.removeItem('student_education');
          if(nextUser.documents) localStorage.setItem('student_documents', nextUser.documents); else localStorage.removeItem('student_documents');
          if(nextUser.applied) localStorage.setItem('student_applied_scholarships', nextUser.applied); else localStorage.removeItem('student_applied_scholarships');
          
          try {
             const localforage = (await import('localforage')).default;
             const usersDbDocs = await localforage.getItem('users_db_docs') || {};
             const nextDocs = usersDbDocs[normalizedEmail];
             if(nextDocs?.photo) await localforage.setItem('student_profile_photo_data', nextDocs.photo); else await localforage.removeItem('student_profile_photo_data');
             if(nextDocs?.docData) await localforage.setItem('student_documents_data', nextDocs.docData); else await localforage.removeItem('student_documents_data');
          } catch(err) { console.error(err); }
        } else {
          localStorage.removeItem("student_personal");
          localStorage.removeItem("student_education");
          localStorage.removeItem("student_documents");
          localStorage.removeItem("student_applied_scholarships");
          try {
             const localforage = (await import('localforage')).default;
             await localforage.removeItem("student_profile_photo_data");
             await localforage.removeItem("student_documents_data");
          } catch(err) { console.error(err); }
          localStorage.setItem("student_personal", JSON.stringify({ email: normalizedEmail }));
        }
      }
      localStorage.setItem("user", JSON.stringify({ email: normalizedEmail }));
    } else {
      localStorage.setItem("user", JSON.stringify({ email: normalizedEmail }));
    }

    // Simulate login by storing role and a mock token
    localStorage.setItem("role", role);
    localStorage.setItem("token", "mock-jwt-token");
    
    // Redirect based on role
    if (role === "STUDENT") {
      router.push("/profile");
    } else if (role === "VERIFYING_OFFICER") {
      router.push("/officer");
    } else if (role === "SYSTEM_ADMIN") {
      router.push("/admin");
    }
  };

  return (
    <AuthLayout>
      <Card className="border-0 shadow-lg rounded-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
          <CardDescription className="text-gray-500">
            Please fill in your details to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="STUDENT">Student</option>
                <option value="VERIFYING_OFFICER">Verifying Officer</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Used for Login)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
                className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="focus-visible:ring-offset-0 focus-visible:ring-orange-500"
              />
            </div>

            <div className="space-y-2 mt-4 p-3 bg-slate-50 border rounded-md">
              <Label>Security Captcha</Label>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-bold text-lg bg-white px-3 py-1 border rounded-md shadow-sm">
                  {captchaNum1} + {captchaNum2} =
                </span>
                <Input
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="?"
                  required
                  className="w-20 focus-visible:ring-offset-0 focus-visible:ring-orange-500"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white mt-4">
              Login <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-orange-600 hover:underline">
              Register as Student
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
