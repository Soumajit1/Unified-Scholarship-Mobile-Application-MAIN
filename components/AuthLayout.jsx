import Image from "next/image";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side: Orange Gradient & Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-orange-400 to-orange-600 text-white p-12">
        <div className="text-center space-y-6">
          {/* We'll use a placeholder emblem for now if we don't have the exact svg */}
          <div className="flex justify-center mb-8">
            <div className="w-32 flex items-center justify-center">
              <img 
                src="/assets/emblem.svg" 
                alt="Ashok Stambha - National Emblem of India" 
                className="w-full h-auto drop-shadow-md"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold leading-tight">
            Unified Scholarship<br />Mobile Application
          </h1>
          <p className="text-xl opacity-90">
            Join the platform today
          </p>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
