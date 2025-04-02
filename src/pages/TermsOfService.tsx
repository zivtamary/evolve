
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p>
            By accessing and using this service, you accept and agree to be bound by the terms
            and provisions of this agreement. If you do not agree to abide by the above, please
            do not use this service.
          </p>
          
          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p>
            The service provides a productivity dashboard with various tools including notes,
            todo lists, pomodoro timer, and events calendar. Premium features include cloud
            synchronization of your data across devices.
          </p>
          
          <h2 className="text-lg font-semibold">3. User Account</h2>
          <p>
            To access certain features of the service, you may be required to register for an
            account. You are responsible for maintaining the confidentiality of your account
            information.
          </p>
          
          <h2 className="text-lg font-semibold">4. Privacy Policy</h2>
          <p>
            Please refer to our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> for
            information about how we collect, use, and disclose information about you.
          </p>
          
          <h2 className="text-lg font-semibold">5. Subscription Services</h2>
          <p>
            Premium features require payment. By subscribing to premium services, you agree to
            the billing terms presented at the time of subscription.
          </p>
          
          <h2 className="text-lg font-semibold">6. Termination</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to the service
            at our sole discretion, without notice, for conduct that we believe violates these
            Terms of Service or is harmful to other users, us, or third parties, or for any other
            reason.
          </p>
          
          <h2 className="text-lg font-semibold">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any
            changes by posting the new Terms of Service on this page.
          </p>
          
          <h2 className="text-lg font-semibold">8. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@example.com.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to="/auth">Return to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TermsOfService;
