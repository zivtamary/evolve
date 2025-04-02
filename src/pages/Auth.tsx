
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/context/SettingsContext';
import BackgroundImage from '@/components/Background/BackgroundImage';
import { ArrowRight, CheckCircle, CloudSync, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'signin' | 'signup' | 'reset_password' | 'success'>('signin');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useSettings();
  
  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }

      if (!agreedToTerms) {
        toast({
          title: "Error",
          description: "You must agree to the Terms of Service and Privacy Policy",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        setView('success');
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user && data.session) {
        toast({
          title: "Welcome back",
          description: "You have been signed in successfully",
        });
        
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!resetEmail) {
        toast({
          title: "Error",
          description: "Please enter your email address",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/auth',
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link",
      });
      
      setView('signin');
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred during password reset",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BackgroundImage>
      <div className="flex justify-center items-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Sign in or create an account to sync your data across devices
            </CardDescription>
          </CardHeader>
          
          {view === 'success' ? (
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h2 className="text-2xl font-bold">Account Created!</h2>
                <p className="text-muted-foreground">
                  Please check your email to confirm your account before logging in.
                </p>
                <Button onClick={() => setView('signin')} className="mt-4">
                  Return to Sign In
                </Button>
              </div>
            </CardContent>
          ) : view === 'reset_password' ? (
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input 
                    id="reset-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Sending reset email..." : "Send Reset Link"}
                </Button>
                
                <p className="text-center text-sm">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto" 
                    onClick={() => setView('signin')}
                  >
                    Back to sign in
                  </Button>
                </p>
              </form>
            </CardContent>
          ) : (
            <CardContent>
              <Tabs defaultValue={view} onValueChange={(value) => setView(value as 'signin' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input 
                          id="signin-email" 
                          type="email" 
                          placeholder="your@email.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password">Password</Label>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs" 
                            onClick={() => setView('reset_password')}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <Input 
                          id="signin-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading}
                      >
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input 
                          id="signup-email" 
                          type="email" 
                          placeholder="your@email.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input 
                          id="signup-password" 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 6 characters
                        </p>
                      </div>

                      <div className="flex items-start space-x-2 pt-2">
                        <Checkbox 
                          id="terms" 
                          checked={agreedToTerms}
                          onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        />
                        <Label htmlFor="terms" className="text-xs leading-tight">
                          I agree to the{" "}
                          <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
                            Privacy Policy
                          </Link>
                        </Label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loading || !agreedToTerms}
                      >
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                  Premium Benefits
                </h3>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CloudSync className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Cloud sync across all your devices
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Secure backup of all your notes, todos and events
                    </span>
                  </li>
                  <li className="flex items-start">
                    <ArrowRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Access your productivity dashboard from anywhere
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          )}
          
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </BackgroundImage>
  );
};

export default Auth;
