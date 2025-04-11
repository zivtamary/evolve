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
        <CardContent className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">1. Introduction</h2>
          <p>
            This Privacy Policy describes how Evolve ("we", "us", or "our") collects, uses, and shares your personal information when you use our service. We are committed to protecting your privacy and ensuring you have a positive experience on our platform.
          </p>
          
          <h2 className="text-lg font-semibold">2. Information We Collect</h2>
          <p>
            <strong>2.1 Account Information</strong><br />
            When you create an account, we collect:
            <ul className="list-disc pl-6 mt-2">
              <li>Email address</li>
              <li>Password (encrypted)</li>
              <li>Account preferences</li>
            </ul>
          </p>
          <p>
            <strong>2.2 User Content</strong><br />
            We store the content you create using our service, including:
            <ul className="list-disc pl-6 mt-2">
              <li>Notes</li>
              <li>Todo lists</li>
              <li>Calendar events</li>
              <li>Custom settings and preferences</li>
            </ul>
          </p>
          <p>
            <strong>2.3 Usage Data</strong><br />
            We collect information about how you use the service, including:
            <ul className="list-disc pl-6 mt-2">
              <li>Features accessed</li>
              <li>Time spent using the service</li>
              <li>Device information</li>
              <li>Browser type and version</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
          <p>
            We use the collected information to:
            <ul className="list-disc pl-6 mt-2">
              <li>Provide and maintain the service</li>
              <li>Improve and personalize your experience</li>
              <li>Communicate with you about updates and changes</li>
              <li>Ensure the security of your account</li>
              <li>Process your payments</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">4. Data Storage and Security</h2>
          <p>
            We implement appropriate security measures to protect your data, including:
            <ul className="list-disc pl-6 mt-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage facilities</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">5. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information with:
            <ul className="list-disc pl-6 mt-2">
              <li>Service providers who assist in operating our service</li>
              <li>Law enforcement when required by law</li>
              <li>Third parties with your explicit consent</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">6. Your Rights</h2>
          <p>
            You have the right to:
            <ul className="list-disc pl-6 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to:
            <ul className="list-disc pl-6 mt-2">
              <li>Remember your preferences</li>
              <li>Understand how you use our service</li>
              <li>Improve our service</li>
            </ul>
            You can control cookie settings through your browser preferences.
          </p>
          
          <h2 className="text-lg font-semibold">8. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>
          
          <h2 className="text-lg font-semibold">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
          </p>
          
          <h2 className="text-lg font-semibold">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2 className="text-lg font-semibold">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@evolve.com.
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
