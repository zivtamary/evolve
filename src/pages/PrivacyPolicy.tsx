import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const PrivacyPolicy = () => {
  const location = useLocation();
  const isDialog = location.state?.isDialog || false;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          {!isDialog ? (
            <div className="flex items-center gap-2">
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
            </div>
          ) : (
            <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-4 text-sm mt-4">
          <h2 className="text-lg font-semibold">1. Introduction</h2>
          <p>
            At Evolve, we care about your privacy. This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using the Service, you agree to this policy.
          </p>

          <h2 className="text-lg font-semibold">2. What We Collect</h2>
          <p>
            <strong>2.1 Account Information</strong><br />
            When you create an account, we collect:
            <ul className="list-disc pl-6 mt-2">
              <li>Your email address</li>
              <li>Your encrypted password</li>
              <li>Your account preferences</li>
            </ul>
          </p>
          <p>
            <strong>2.2 Your Content</strong><br />
            We store content you create in Evolve to provide the service, including:
            <ul className="list-disc pl-6 mt-2">
              <li>Notes</li>
              <li>To-do lists</li>
              <li>Calendar events</li>
              <li>Widgets and customizations</li>
            </ul>
          </p>
          <p>
            <strong>2.3 Usage & Device Data</strong><br />
            To improve your experience and the reliability of the service, we collect:
            <ul className="list-disc pl-6 mt-2">
              <li>Pages and features you use</li>
              <li>Time spent using the app</li>
              <li>Device and browser type</li>
              <li>Error logs and general diagnostics</li>
            </ul>
          </p>

          <h2 className="text-lg font-semibold">3. How We Use Your Data</h2>
          <p>
            We use your data to:
            <ul className="list-disc pl-6 mt-2">
              <li>Provide and improve the service</li>
              <li>Sync your content across devices (Premium only)</li>
              <li>Send you service-related emails</li>
              <li>Personalize features and suggestions</li>
              <li>Process payments (for Premium subscriptions)</li>
            </ul>
          </p>

          <h2 className="text-lg font-semibold">4. Security</h2>
          <p>
            We take security seriously. Your data is protected using:
            <ul className="list-disc pl-6 mt-2">
              <li>Encryption in transit and at rest</li>
              <li>Authentication and access controls</li>
              <li>Routine security checks and best practices</li>
            </ul>
            However, no system is completely secure. You are responsible for keeping your login credentials safe.
          </p>

          <h2 className="text-lg font-semibold">5. Sharing Your Info</h2>
          <p>
            We never sell your data. We may share limited info with:
            <ul className="list-disc pl-6 mt-2">
              <li>Service providers (like hosting and billing)</li>
              <li>Law enforcement if legally required</li>
              <li>Others — but only with your explicit consent</li>
            </ul>
          </p>

          <h2 className="text-lg font-semibold">6. Your Rights</h2>
          <p>
            You can:
            <ul className="list-disc pl-6 mt-2">
              <li>Access or export your data</li>
              <li>Update your information</li>
              <li>Request account deletion</li>
              <li>Opt-out of promotional emails</li>
            </ul>
            Contact us at <a href="mailto:privacy@evolve-app.com" className="underline">privacy@evolve-app.com</a> for any of these requests.
          </p>

          <h2 className="text-lg font-semibold">7. Cookies & Tracking</h2>
          <p>
            We use cookies and local storage to:
            <ul className="list-disc pl-6 mt-2">
              <li>Keep you logged in</li>
              <li>Save your preferences</li>
              <li>Understand how people use Evolve</li>
            </ul>
            You can disable cookies in your browser, but it may limit functionality.
          </p>

          <h2 className="text-lg font-semibold">8. Children’s Privacy</h2>
          <p>
            Evolve is not intended for children under 13. We do not knowingly collect personal data from children. If we become aware of such data, we’ll delete it promptly.
          </p>

          <h2 className="text-lg font-semibold">9. International Users</h2>
          <p>
            If you use Evolve outside your country, your data may be transferred to and stored in a country with different privacy laws. We ensure your information is protected regardless of location.
          </p>

          <h2 className="text-lg font-semibold">10. Changes to This Policy</h2>
          <p>
            We may occasionally update this policy. We'll notify you of significant changes by updating the date below and, when appropriate, through the Service.
          </p>

          <h2 className="text-lg font-semibold">11. Contact Us</h2>
          <p>
            Have questions or concerns? Email us at <a href="mailto:privacy@evolve-app.com" className="underline">privacy@evolve-app.com</a>.
          </p>

          <p className="text-xs text-muted-foreground mt-4">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </CardContent>
        <CardFooter>
          {!isDialog ? (
            <Button asChild className="w-full">
              <Link to="/auth?tab=signup">Return to Sign Up</Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Open in new page
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
