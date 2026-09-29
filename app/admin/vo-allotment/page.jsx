"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, CheckCircle, ShieldAlert } from "lucide-react";

export default function VOAllotmentPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateVO = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    setTimeout(() => {
      try {
        const db = JSON.parse(localStorage.getItem('users_db') || '{}');
        
        if (db[username]) {
          setError("An account with this username already exists.");
        } else {
          db[username] = {
            email: username,
            password: password,
            role: 'VERIFYING_OFFICER',
            status: 'ACTIVE'
          };
          localStorage.setItem('users_db', JSON.stringify(db));
          setMessage("Verifying Officer account created successfully!");
          setUsername("");
          setPassword("");
        }
      } catch(err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto mt-10">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-red-100 text-red-700 rounded-full mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">V.O. Allotment</h1>
        <p className="text-slate-500 mt-2">Create new Verifying Officer credentials to securely log into the portal.</p>
      </div>

      <Card className="border-slate-200 shadow-md">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg">Generate Credentials</CardTitle>
          <CardDescription>Enter an email or username and a secure password.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreateVO} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email / Username</label>
              <Input 
                type="text" 
                placeholder="officer@example.com" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus-visible:ring-red-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input 
                type="password" 
                placeholder="Enter a secure password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus-visible:ring-red-500"
              />
            </div>

            {message && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                {message}
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm mt-4"
            >
              {loading ? "Creating..." : "Create Verifying Officer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
