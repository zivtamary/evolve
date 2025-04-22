import React, { useState, useEffect, useTransition, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/context/SettingsContext";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Cloud,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import TermsDialog from "@/components/Dialogs/TermsDialog";
import PrivacyDialog from "@/components/Dialogs/PrivacyDialog";

const slideAnimation = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { type: "spring", duration: 0.4, bounce: 0.1 },
};

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog = ({ open, onOpenChange }: AuthDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<
    "signin" | "signup" | "reset_password" | "success"
  >("signin");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const isSigningIn = useRef(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useSettings();

  useEffect(() => {
    if (isAuthenticated) {
      onOpenChange(false);
    }
  }, [isAuthenticated, onOpenChange]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }

      if (!agreedToTerms) {
        toast({
          title: "Error",
          description:
            "You must agree to the Terms of Service and Privacy Policy",
          variant: "destructive",
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
        setView("success");
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during sign up";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
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
          variant: "destructive",
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
          action: <Sparkles className="size-5" />,
        });

        onOpenChange(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during sign in";
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
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
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: "https://evolve-app.com/reset-password",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link",
      });

      setView("signin");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during password reset";
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (loading) return;

    setLoading(true);

    const manifest = chrome.runtime.getManifest()
    const url = new URL('https://accounts.google.com/o/oauth2/auth')
    url.searchParams.set('client_id', manifest.oauth2.client_id)
    url.searchParams.set('response_type', 'id_token')
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('redirect_uri', `https://${chrome.runtime.id}.chromiumapp.org`)
    url.searchParams.set('scope', manifest.oauth2.scopes.join(' '))
    chrome.identity.launchWebAuthFlow(
      {
        url: url.href,
        interactive: true,
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError) {
          // auth was not successful
        } else {
          // auth was successful, extract the ID token from the redirectedTo URL
          const url = new URL(redirectedTo)
          const params = new URLSearchParams(url.hash.replace('#', ''))
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: params.get('id_token'),
          }).catch((error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An error occurred during Google sign in";
            toast({
              title: "Google sign in failed",
              description: errorMessage,
              variant: "destructive",
            });
          }).finally(() => {
            setLoading(false);
          })
          if (error) {
            const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred during Google sign in";
        toast({
          title: "Google sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
          }
          if (data.user) {
            toast({
              title: "Welcome back",
              description: "You have been signed in successfully",
            });
            onOpenChange(false);
          }
        }
      }
    )

/*         supabase.auth
      .signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`
        },
      })
      .catch((error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An error occurred during Google sign in";
        toast({
          title: "Google sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
      }); */
  };

  const renderHeader = () => {
    const headerContent =
      view === "reset_password" ? (
        <>
          <CardTitle className="text-xl font-semibold">
            Reset Password
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Enter your email to receive a password reset link
          </CardDescription>
        </>
      ) : view === "signup" ? (
        <>
          <CardTitle className="text-xl font-semibold">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Sign up to sync your data across all your devices, and more!
          </CardDescription>
        </>
      ) : (
        <>
          <CardTitle className="text-xl font-semibold">Welcome Back</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Sign in to continue to your dashboard
          </CardDescription>
        </>
      );

    return (
      <div className="relative">
        {view === "reset_password" ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (view === "reset_password") {
                setView("signin");
              } else {
                onOpenChange(false);
              }
            }}
            className="absolute -left-3 top-0 h-8 w-8 rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <div className={view === "reset_password" ? "pl-7" : ""}>
          {headerContent}
        </div>
      </div>
    );
  };

  const renderAuthContent = () => {
    if (view === "success") {
      return (
        <motion.div {...slideAnimation} className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold">Account Created!</h2>
            <p className="text-muted-foreground">
              Please check your email to confirm your account before logging in.
            </p>
            <Button onClick={() => setView("signin")} className="mt-4">
              Return to Sign In
            </Button>
          </div>
        </motion.div>
      );
    }

    if (view === "reset_password") {
      return (
        <motion.div {...slideAnimation}>
          <form onSubmit={handleResetPassword} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="dark:text-gray-200">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              variant="link"
            >
              {loading ? "Sending reset email..." : "Send Reset Link"}
            </Button>
          </form>
        </motion.div>
      );
    }

    const disableGoogleSignIn = loading || isPending;
    // const disableGoogleSignIn = true // TODO: Remove this

    return (
      <motion.div {...slideAnimation}>
        <Tabs
          defaultValue={view}
          onValueChange={(value) => setView(value as "signin" | "signup")}
        >
          <TabsList className="grid w-full grid-cols-2 mt-4 mb-6 p-0 bg-background dark:bg-black/40 dark:border dark:border-white/10 border">
            <TabsTrigger
              value="signin"
              className="dark:data-[state=active]:bg-white/10 h-full rounded-r-none dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white dark:border-white/10 data-[state=active]:text-black/80 data-[state=active]:bg-black/10 text-black/50"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="dark:data-[state=active]:bg-white/10 h-full rounded-l-none dark:data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white dark:border-white/10 data-[state=active]:text-black data-[state=active]:bg-black/10 text-black/50"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="signin" asChild key="signin">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              >
                <form onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="signin-email"
                        className="dark:text-gray-200"
                      >
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="signin-password"
                          className="dark:text-gray-200"
                        >
                          Password
                        </Label>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-xs dark:text-gray-300 dark:hover:text-gray-100"
                          onClick={() => setView("reset_password")}
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          placeholder="********"
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full transition-colors dark:border dark:border-white/10 dark:hover:border-white dark:hover:bg-black/60 dark:text-white dark:hover:text-white"
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t dark:border-gray-700/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground dark:bg-black/40 dark:text-gray-400 dark:border dark:border-white/10 rounded-md">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full dark:bg-black/40 dark:hover:border-white dark:hover:bg-black/60 dark:text-white dark:border-white/10 active:dark:bg-black/80"
                      onClick={handleGoogleSignIn}
                      disabled={disableGoogleSignIn}
                    >
                      <FcGoogle className="mr-2 h-4 w-4" />
                      {loading || isPending
                        ? "Signing in..."
                        : "Sign in with Google"}
                    </Button>
                    {/* By continuing, you agree to the Terms of Service and Privacy Policy */}
                    <p className="text-xs text-muted-foreground dark:text-gray-400 text-center">
                        <span className="text-primary dark:text-primary/90">
                            By continuing, you agree to the <a target="_blank" rel="noopener noreferrer" href="https://evolve-app.com/terms-of-service" className="hover:underline">Terms of Service</a> and <a target="_blank" rel="noopener noreferrer" href="https://evolve-app.com/privacy-policy" className="hover:underline">Privacy Policy</a>
                        </span>
                    </p>
                  </div>
                </form>
              </motion.div>
            </TabsContent>

            <TabsContent value="signup" asChild key="signup">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              >
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-email"
                        className="dark:text-gray-200"
                      >
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="dark:text-gray-200"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-gray-400">
                        Password must be at least 6 characters
                      </p>
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) =>
                          setAgreedToTerms(checked === true)
                        }
                        className="dark:border-gray-600"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-xs leading-tight dark:text-gray-300"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setTermsDialogOpen(true)}
                          className="text-primary hover:underline dark:text-primary/90"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={() => setPrivacyDialogOpen(true)}
                          className="text-primary hover:underline dark:text-primary/90"
                        >
                          Privacy Policy
                        </button>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full transition-colors dark:bg-black/60 dark:hover:bg-black/80 dark:text-white dark:border dark:border-white/10"
                      disabled={loading || !agreedToTerms}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <Separator className="my-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-4 dark:text-gray-100"
        >
          <h3 className="text-lg font-medium flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
            Premium Benefits
          </h3>

          <ul className="space-y-2">
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start dark:text-gray-300"
            >
              <Cloud className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">
                Cloud sync across all your devices
              </span>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start dark:text-gray-300"
            >
              <CheckCircle className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">
                Secure backup of all your notes, todos and events
              </span>
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-start dark:text-gray-300"
            >
              <ArrowRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">
                Access your productivity dashboard from anywhere
              </span>
            </motion.li>
          </ul>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] border-0 p-0">
        <div className="light">
          <Card className="w-full h-full overflow-hidden border-0 bg-white/95 backdrop-blur-md shadow-lg shadow-black/10 dark:shadow-black/20 dark:bg-black/90">
            <CardHeader className="text-gray-900 dark:text-white">
              {renderHeader()}
            </CardHeader>

            <CardContent className="text-gray-800 dark:text-gray-200">
              <AnimatePresence mode="wait" initial={false}>
                {renderAuthContent()}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Terms and Privacy Dialogs */}
        <TermsDialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />
        <PrivacyDialog
          open={privacyDialogOpen}
          onOpenChange={setPrivacyDialogOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
