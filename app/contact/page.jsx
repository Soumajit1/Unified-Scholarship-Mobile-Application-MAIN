import { Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Contact() {
  const contacts = [
    {
      scholarship: "Pre-Matric Scholarship for ST Students",
      authority: "Ministry of Tribal Affairs (MoTA)",
      phone: "011-23381643",
      email: "prematric-mota@gov.in",
      address: "Shastri Bhawan, New Delhi - 110001"
    },
    {
      scholarship: "Post-Matric Scholarship for ST Students",
      authority: "Ministry of Tribal Affairs (MoTA)",
      phone: "011-23385487",
      email: "postmatric-mota@gov.in",
      address: "Shastri Bhawan, New Delhi - 110001"
    },
    {
      scholarship: "National Fellowship for Higher Education of ST Students",
      authority: "Ministry of Tribal Affairs (MoTA) / UGC",
      phone: "011-23382527",
      email: "fellowship-mota@gov.in",
      address: "Jeevan Tara Building, Parliament Street, New Delhi - 110001"
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h1>
      <p className="text-gray-600 mb-8 max-w-3xl">
        If you have any queries or face issues regarding your scholarship application, please contact the respective authorities below.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact, idx) => (
          <Card key={idx} className="border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-3 border-b border-orange-100">
              <CardTitle className="text-lg text-orange-900">{contact.scholarship}</CardTitle>
              <CardDescription className="text-orange-700 font-medium">{contact.authority}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Helpline</p>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Email</p>
                  <a href={`mailto:${contact.email}`} className="text-sm text-orange-600 hover:underline">{contact.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Address</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{contact.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-slate-50 border rounded-lg max-w-3xl">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Technical Support</h3>
        <p className="text-gray-600 text-sm mb-4">
          For technical issues related to the portal, document uploads, or login problems, please reach out to the unified support desk.
        </p>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium">1800-11-2026 (Toll Free)</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <a href="mailto:support@scholarships.gov.in" className="text-sm font-medium text-blue-600 hover:underline">support@scholarships.gov.in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
