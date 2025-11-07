import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            This is a private tool restricted to authorized team members only. 
            If you believe you should have access, please contact the administrator.
          </p>
          <div className="space-y-2">
            <p className="text-xs text-gray-500 text-center font-medium">
              Contact Information:
            </p>
            <p className="text-xs text-gray-500 text-center">
              Roger Johnson<br />
              <a href="mailto:rogerprw@gmail.com" className="text-blue-600 hover:underline">
                rogerprw@gmail.com
              </a>
            </p>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/'}
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
