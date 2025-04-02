
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us when you create an account, such as
            your email address and authentication information. We also collect information about
            your usage of the service, including notes, todos, events, and other data you input.
          </p>
          
          <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          <p>
            We use your information to provide, maintain, and improve our services, to communicate
            with you, and to personalize your experience. If you enable cloud synchronization, your
            data will be stored on our servers to provide this functionality.
          </p>
          
          <h2 className="text-lg font-semibold">3. Data Storage and Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. Your
            data is stored in secure databases and we use encryption to protect data in transit.
          </p>
          
          <h2 className="text-lg font-semibold">4. Data Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to outside parties.
            This does not include trusted third parties who assist us in operating our service, as long
            as these parties agree to keep this information confidential.
          </p>
          
          <h2 className="text-lg font-semibold">5. Your Choices</h2>
          <p>
            You can choose not to provide certain information, but this may limit your ability to use
            certain features. You can also delete your account at any time, which will remove all your
            data from our servers.
          </p>
          
          <h2 className="text-lg font-semibold">6. Cookies</h2>
          <p>
            We use cookies to understand and save your preferences for future visits and to compile
            aggregate data about site traffic and site interaction.
          </p>
          
          <h2 className="text-lg font-semibold">7. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by
            posting the new privacy policy on this page.
          </p>
          
          <h2 className="text-lg font-semibold">8. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at privacy@example.com.
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

export default PrivacyPolicy;
