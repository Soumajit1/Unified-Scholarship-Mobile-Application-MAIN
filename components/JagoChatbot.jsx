"use client";
import React, { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export function JagoChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am JAGO, your scholarship assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Mock response
    setTimeout(() => {
      let botResponse = "I can help you with eligibility, application status, required documents, or disbursement details.";
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("status")) {
        botResponse = "Your Post-Matric Scholarship application is currently pending verification at the Institute level.";
      } else if (lowerInput.includes("eligibility") || lowerInput.includes("eligible")) {
        botResponse = "You can check eligibility for Pre-Matric, Post-Matric, Top Class, NFST, and NOS schemes. Which one are you interested in?";
      } else if (lowerInput.includes("document")) {
        botResponse = "You can upload your documents or fetch them directly from DigiLocker via the Document Wallet.";
      }
      
      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);
    }, 1000);
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 shadow-2xl z-50">
          <CardHeader className="flex flex-row items-center justify-between bg-primary text-primary-foreground rounded-t-lg p-4">
            <CardTitle className="text-md">JAGO Chatbot</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/90">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-80 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.isBot ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="p-3 bg-background border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full gap-2">
              <Input 
                placeholder="Type your message..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}