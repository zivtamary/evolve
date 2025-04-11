import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyDialog: React.FC<PrivacyDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeButtonClassName="text-foreground" className="max-w-4xl max-h-[90vh] bg-background text-foregroud overflow-auto">
        <DialogHeader className=''>
          <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">1. Introduction</h2>
          <p>
            This Privacy Policy describes how Evolve ("we", "us", or "our") collects, uses, and protects your personal information when you use our Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>
          
          <h2 className="text-lg font-semibold">2. Information We Collect</h2>
          <p>
            <strong>2.1 Account Information</strong><br />
            When you create an account, we collect:
            <ul className="list-disc pl-6 mt-2">
              <li>Email address</li>
              <li>Authentication credentials</li>
              <li>Account preferences and settings</li>
            </ul>
          </p>
          <p>
            <strong>2.2 User Content</strong><br />
            We store the content you create and upload to the Service, including:
            <ul className="list-disc pl-6 mt-2">
              <li>Notes and documents</li>
              <li>Todo lists and tasks</li>
              <li>Calendar events and appointments</li>
              <li>Pomodoro timer settings and statistics</li>
            </ul>
          </p>
          <p>
            <strong>2.3 Usage Data</strong><br />
            We automatically collect information about how you use the Service, including:
            <ul className="list-disc pl-6 mt-2">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage patterns and preferences</li>
              <li>Error logs and performance data</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
          <p>
            We use the collected information to:
            <ul className="list-disc pl-6 mt-2">
              <li>Provide and maintain the Service</li>
              <li>Enable cloud synchronization across your devices</li>
              <li>Improve and personalize your experience</li>
              <li>Process payments and manage subscriptions</li>
              <li>Communicate with you about the Service</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">4. Data Storage and Security</h2>
          <p>
            We implement robust security measures to protect your data:
            <ul className="list-disc pl-6 mt-2">
              <li>Data encryption in transit and at rest</li>
              <li>Secure server infrastructure with regular security updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular security audits and monitoring</li>
            </ul>
          </p>
          <p>
            While we take reasonable steps to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to maintaining industry-standard protections.
          </p>
          
          <h2 className="text-lg font-semibold">5. Data Sharing and Third Parties</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            <ul className="list-disc pl-6 mt-2">
              <li>Service providers who assist in operating the Service (e.g., payment processors, hosting providers)</li>
              <li>Law enforcement when required by law or to protect our rights</li>
              <li>Other parties with your explicit consent</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">6. Your Rights and Choices</h2>
          <p>
            You have the right to:
            <ul className="list-disc pl-6 mt-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of certain data collection</li>
              <li>Delete your account and associated data</li>
            </ul>
          </p>
          
          <h2 className="text-lg font-semibold">7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to:
            <ul className="list-disc pl-6 mt-2">
              <li>Maintain your session and authentication state</li>
              <li>Remember your preferences</li>
              <li>Analyze usage patterns</li>
              <li>Improve the Service</li>
            </ul>
            You can control cookies through your browser settings.
          </p>
          
          <h2 className="text-lg font-semibold">8. Children's Privacy</h2>
          <p>
            The Service is not intended for use by children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>
          
          <h2 className="text-lg font-semibold">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable data protection laws.
          </p>
          
          <h2 className="text-lg font-semibold">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes acceptance of the new policy.
          </p>
          
          <h2 className="text-lg font-semibold">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@evolve.com.
          </p>
          
          <p className="text-xs text-muted-foreground mt-4">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Open in new page
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyDialog; 