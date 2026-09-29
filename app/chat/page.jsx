"use client";
import React, { useState } from "react";
import { Send, Bot, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function Chat() {
  const [messages, setMessages] = useState([
    { text: "Namaste! I am JAGO, your intelligent Scholarship Assistant. I can help you with eligibility, application status, required documents, deficiencies, and disbursements. What would you like to know?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || "YOUR_GROQ_API_KEY_HERE";
      
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: `You are JAGO, an intelligent Scholarship Assistant for the Government of India. You speak ${language}. Keep answers concise, helpful, and formatted in HTML (use <b>, <ul>, <br>). Avoid markdown like **.` },
            ...messages.slice(1).map(m => ({ role: m.isBot ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: userMsg.text }
          ]
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      setMessages(prev => [...prev, { text: data.choices[0].message.content, isBot: true }]);
    } catch(err) {
      console.error("Groq API failed, falling back to local mock:", err);
      // Fallback to offline smart mock
      let reply = "I'm sorry, I don't understand that query. I can help with scholarship eligibility, application status, or documents.";
      const lowerInput = userMsg.text.toLowerCase();
      
      if (lowerInput.includes('status') || lowerInput.includes('track')) {
        const applied = JSON.parse(localStorage.getItem('student_applied_scholarships') || '[]');
        if (applied.length > 0) {
          reply = `You have <b>${applied.length}</b> active application(s). Your most recent application is currently <span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">Pending Verification</span>.`;
        } else {
          reply = "You haven't submitted any applications yet. Head over to the 'Apply Scholarship' tab to find one that suits you!";
        }
      } else if (lowerInput.includes('document') || lowerInput.includes('upload')) {
         reply = "You must upload mandatory documents like your <b>Aadhaar Card, Previous Year Marksheet, Fee Receipt, and Income Certificate</b>. You can upload these in the 'Update Profile' section under 'My Documents'.";
      } else if (lowerInput.includes('eligibility') || lowerInput.includes('who can apply') || lowerInput.includes('scholarship')) {
         reply = "Generally, ST students with a family income below ₹2.5 Lakhs per annum are eligible for MoTA Pre-Matric and Post-Matric scholarships. For the National Fellowship, the income limit is ₹6.0 Lakhs.";
      } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
         reply = "Hello! I am JAGO. How can I assist you with your scholarship journey today?";
      }
      
      setMessages((prev) => [...prev, { text: reply, isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Chat Support (JAGO)</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-gray-500" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm bg-white"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Bengali">Bengali</option>
            </select>
          </div>
        </div>
      </div>
      
      <Card className="max-w-3xl mx-auto h-[600px] flex flex-col border-2 border-primary/20">
        <CardHeader className="flex flex-row items-center gap-3 bg-primary text-primary-foreground rounded-t-lg p-4">
          <Bot className="h-6 w-6" />
          <CardTitle className="text-lg">JAGO Chatbot</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
              <div 
                className={`rounded-lg px-4 py-3 max-w-[80%] text-sm shadow-sm ${msg.isBot ? "bg-white border border-gray-200 text-gray-800" : "bg-primary text-primary-foreground"}`}
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-3 max-w-[80%] text-sm bg-white border border-gray-200 text-gray-500">
                JAGO is typing...
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-background border-t">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2">
            <Input 
              placeholder={`Ask JAGO in ${language}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}