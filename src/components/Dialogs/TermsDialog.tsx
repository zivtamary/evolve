import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsDialog: React.FC<TermsDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeButtonClassName="text-foreground" className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
          <p>
            By using Evolve ("the Service"), you agree to these Terms of Service. If you do not agree, please discontinue use of the Service. These terms are a legally binding agreement between you and us.
          </p>

          <h2 className="text-lg font-semibold">2. Description of Service</h2>
          <p>
            Evolve is a Chrome extension that serves as a customizable start page and productivity dashboard. It includes tools such as:
            <ul className="list-disc pl-6 mt-2">
              <li>Notes for capturing and organizing your thoughts</li>
              <li>To-do lists for managing tasks</li>
              <li>Pomodoro timer for focused work sessions</li>
              <li>Calendar for scheduling events</li>
              <li>Weather and search widgets</li>
            </ul>
            Premium users get additional features like cloud sync across devices.
          </p>

          <h2 className="text-lg font-semibold">3. User Accounts</h2>
          <p>
            Some features require an account. You are responsible for:
            <ul className="list-disc pl-6 mt-2">
              <li>Maintaining the confidentiality of your credentials</li>
              <li>All activity under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </p>

          <h2 className="text-lg font-semibold">4. Privacy</h2>
          <p>
            Your use of the Service is subject to our Privacy Policy. We are committed to protecting your data, but you acknowledge no system is 100% secure. Use of the Service is at your own risk.
          </p>

          <h2 className="text-lg font-semibold">5. Subscriptions</h2>
          <p><strong>5.1 Premium Features</strong><br />
            Access to certain features requires a paid subscription. By subscribing, you agree to:
            <ul className="list-disc pl-6 mt-2">
              <li>Pay the applicable fees</li>
              <li>Provide accurate billing info</li>
              <li>Authorize us to charge your payment method</li>
            </ul>
          </p>
          <p><strong>5.2 Billing & Payments</strong><br />
            Subscriptions are billed upfront on a monthly or yearly basis through Polar (via Stripe). Charges occur at the beginning of each billing cycle.
          </p>
          <p><strong>5.3 Cancellations & Refunds</strong><br />
            You can cancel anytime. Your subscription remains active until the current billing period ends. Refunds are not guaranteed and are issued only where required by law or in exceptional cases.
          </p>

          <h2 className="text-lg font-semibold">6. Data Handling & Security</h2>
          <p>
            We use industry-standard security to protect your data, but:
            <ul className="list-disc pl-6 mt-2">
              <li>No internet transmission is completely secure</li>
              <li>We cannot promise absolute security</li>
              <li>You’re responsible for your own account safety</li>
            </ul>
          </p>

          <h2 className="text-lg font-semibold">7. User Content</h2>
          <p>
            You retain ownership of your content (e.g., notes, tasks). You grant us permission to store, process, and sync it solely to provide the Service.
          </p>

          <h2 className="text-lg font-semibold">8. Acceptable Use</h2>
          <p>
            Do not misuse the Service. We may suspend or terminate your account if you:
            <ul className="list-disc pl-6 mt-2">
              <li>Violate these terms</li>
              <li>Disrupt the service for others</li>
              <li>Engage in harmful or illegal activity</li>
              <li>Fail to pay subscription fees</li>
            </ul>
          </p>

          <h2 className="text-lg font-semibold">9. Modifications to the Service</h2>
          <p>
            We may change or discontinue parts of the Service without notice. We're not liable for any interruptions or changes.
          </p>

          <h2 className="text-lg font-semibold">10. Updates to Terms</h2>
          <p>
            We may revise these Terms at any time. Material changes will be posted in the extension or on our website. Continued use of the Service means you accept the updated terms.
          </p>

          <h2 className="text-lg font-semibold">11. Contact</h2>
          <p>
            Questions? Reach us at <a href="mailto:support@evolve-app.com" className="underline">support@evolve-app.com</a>.
          </p>

          <p className="text-xs text-muted-foreground mt-4">
            Last Updated: 17/04/2025
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer">
              Open in new page
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsDialog;
