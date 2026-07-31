import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      
      <div className="text-center">
        
        <p className="text-8xl font-bold text-brand-500 mb-4">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          
          This page doesn&apos;t exist or was moved. Let&apos;s get you back on
          track.
        </p>
        <Link href="/" className="btn-primary">
          
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
