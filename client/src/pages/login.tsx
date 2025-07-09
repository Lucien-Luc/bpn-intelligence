import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginData } from "@shared/schema";

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
            <div className="text-6xl font-bold mb-4">BPN</div>
            <div className="text-xl opacity-90">Business Professionals Network</div>
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
                BPN Intelligence
              </h1>
              <p className="text-gray-600">Business AI Assistant Platform</p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}