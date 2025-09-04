"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useAppData, AppProvider } from '@/context/app-context';
import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, Eye, EyeOff } from 'lucide-react';

function AdminLoginPageContent() {
  const [restaurantId, setRestaurantId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setRestaurantId: setAppContextRestaurantId } = useAppData();
  const router = useRouter();

  useEffect(() => {
    setRestaurantId('your-restaurant-id');
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (restaurantId) {
      setAppContextRestaurantId(restaurantId);
      router.push('/admin/dashboard');
    } else {
      setError('Please enter a Restaurant ID.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="space-y-2">
            <h1 className="heading-responsive text-center">Welcome Back</h1>
            <p className="text-muted-foreground text-responsive">
              Sign in to manage your restaurant
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="card-modern border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-center">
              Admin Login
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurant-id" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Restaurant ID
                </Label>
                <Input
                  id="restaurant-id"
                  placeholder="your-restaurant-id"
                  required
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)}
                  className="input-modern h-11 sm:h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Try: <code className="bg-muted px-1 py-0.5 rounded">your-restaurant-id</code> or <code className="bg-muted px-1 py-0.5 rounded">paradise-biryani</code>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-modern h-11 sm:h-12 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-11 sm:h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Secure admin access for restaurant management
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
    return (
        <AppProvider>
            <AdminLoginPageContent />
        </AppProvider>
    )
}
