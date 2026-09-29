"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function Wallet() {
  const documents = [
    { name: "Aadhaar Card", verified: true, source: "UIDAI" },
    { name: "ST/PVTG Certificate", verified: true, source: "State e-District" },
    { name: "Income Certificate", verified: false, source: "State e-District" },
    { name: "Academic Records", verified: true, source: "DigiLocker/APAAR" },
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Digital Document Wallet</h1>
          <p className="text-muted-foreground">Manage your documents verified through API integration.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Fetch from DigiLocker
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {documents.map((doc) => (
          <Card key={doc.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{doc.name}</CardTitle>
              {doc.verified ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="flex justify-between items-center mt-2">
                <span>Source: {doc.source}</span>
                <Badge variant={doc.verified ? "default" : "secondary"}>
                  {doc.verified ? "Verified" : "Pending Verification"}
                </Badge>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}