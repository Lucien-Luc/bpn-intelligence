import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginData } from "@shared/schema";
import bpnLogo from "@assets/logo_1752044485701.png";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      await authService.login(data.email, data.password);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - BPN Branding */}
      <div className="flex-1 bg-[#00728e] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="mb-8">
            <a 
              href="https://www.bpn.rw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition-opacity duration-300"
            >
              <img 
                src={bpnLogo} 
                alt="BPN - Business Professionals Network" 
                className="w-64 h-auto mx-auto mb-4 cursor-pointer brightness-0 invert"
              />
            </a>
            
          </div>
          <div className="w-16 h-1 bg-white opacity-50 mx-auto"></div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 neuromorphic-card">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00728e] to-[#005a70] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-brain text-white text-xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                BPN Corporate Assistant
              </h1>
              <p className="text-gray-600">Internal Operations Support System</p>
            </div>

            {/* Microsoft Sign In Button */}
            <div className="mb-6">
              <a
                href="/api/microsoft/auth/microsoft"
                className="w-full flex items-center justify-center gap-3 bg-[#0078d4] text-white py-3 px-4 rounded-xl hover:bg-[#106ebe] focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:ring-offset-2 font-medium transition-all duration-300 shadow-lg neuromorphic-button"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M1 1h10v10H1V1zm12 0h10v10H13V1zM1 13h10v10H1V13zm12 0h10v10H13V13z"/>
                </svg>
                Sign in with Microsoft (@bpn.rw)
              </a>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="neuromorphic-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          className="neuromorphic-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full neuromorphic-button bg-gradient-to-r from-[#00728e] to-[#005a70] hover:from-[#005a70] hover:to-[#004a5c] text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <div className="text-xs text-gray-500 mb-2">Demo credentials:</div>
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <div>admin@company.com</div>
                <div>password123</div>
              </div>
              
              <div className="mt-4 text-xs text-gray-400">
                <p>Microsoft Graph authentication requires Azure AD configuration.</p>
                <p>Contact your administrator for @bpn.rw domain access.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}