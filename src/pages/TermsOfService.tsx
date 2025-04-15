import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const TermsOfService = () => {
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
              <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
            </div>
          ) : (
            <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
          )}
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Evolve - Aesthetic Startpage ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms constitute a legally binding agreement between you and Evolve.
          </p>
          
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p>
            Evolve is a productivity dashboard that provides various tools including:
            <ul className="list-disc pl-6 mt-2">
              <li>Notes for capturing and organizing your thoughts</li>
              <li>Todo lists for task management</li>
              <li>Pomodoro timer for focused work sessions</li>
              <li>Events calendar for scheduling and planning</li>
            </ul>
            Premium features include cloud synchronization of your data across devices.
          </p>
          
          <h2 className="text-lg font-semibold">3. User Account</h2>
          <p>
            To access certain features of the Service, you must register for an account. You are responsible for:
            <ul className="list-disc pl-6 mt-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Immediately notifying us of any unauthorized use of your account</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">4. Privacy Policy</h2>
          <p>
            Your use of the Service is also governed by our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>. Please review it carefully to understand how we collect, use, and protect your information.
          </p>
          
          <h2 className="text-lg font-semibold">5. Subscription Services</h2>
          <p>
            <strong>5.1 Premium Features</strong><br />
            Access to premium features requires a paid subscription. By subscribing, you agree to:
            <ul className="list-disc pl-6 mt-2">
              <li>Pay all fees associated with your subscription</li>
              <li>Provide accurate billing information</li>
              <li>Authorize us to charge your payment method</li>
            </ul>
          </p>
          <p>
            <strong>5.2 Billing and Payments</strong><br />
            Subscriptions are billed in advance on a monthly or yearly basis. You will be charged at the beginning of each billing cycle. We use secure third-party payment processors to handle all transactions.
          </p>
          <p>
            <strong>5.3 Cancellation and Refunds</strong><br />
            You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. Refunds are not typically provided unless required by law or at our sole discretion in exceptional circumstances.
          </p>
          
          <h2 className="text-lg font-semibold">6. Data Handling and Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. However, you acknowledge that:
            <ul className="list-disc pl-6 mt-2">
              <li>No method of transmission over the internet is 100% secure</li>
              <li>We cannot guarantee absolute security of your data</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">7. User Content</h2>
          <p>
            You retain ownership of all content you create or upload to the Service. By using the Service, you grant us a license to store, process, and transmit your content as necessary to provide the Service.
          </p>
          
          <h2 className="text-lg font-semibold">8. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for:
            <ul className="list-disc pl-6 mt-2">
              <li>Violation of these Terms of Service</li>
              <li>Conduct harmful to other users or the Service</li>
              <li>Non-payment of subscription fees</li>
              <li>Any other reason we deem necessary</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes acceptance of the new terms.
          </p>
          
          <h2 className="text-lg font-semibold">10. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@evolve.com.
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
              <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer">
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

export default TermsOfService;
