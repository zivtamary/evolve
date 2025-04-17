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
      <DialogContent
        closeButtonClassName="text-foreground"
        className="max-w-4xl max-h-[90vh] bg-background text-foreground overflow-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">1. Introduction</h2>
          <p>
            This Privacy Policy explains how Evolve ("we", "us", "our") collects, uses, and protects your
            information when you use our Chrome extension ("the Service").
          </p>

          <h2 className="text-lg font-semibold">2. Information We Collect</h2>
          <p>
            <strong>2.1 Account Information</strong>
          </p>
          <ul className="list-disc pl-6">
            <li>Email address (for login and syncing features)</li>
            <li>Authentication credentials (handled securely through our authentication provider)</li>
          </ul>
          <p>
            <strong>2.2 Usage Data</strong>
          </p>
          <ul className="list-disc pl-6">
            <li>Interaction with features such as notes, to-do list, calendar, and timer</li>
            <li>Optional location (used solely for weather widget; not stored)</li>
          </ul>

          <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6">
            <li>To provide core functionalities (custom widgets, sync, weather, etc.)</li>
            <li>To sync data between devices for subscribed users</li>
            <li>To process subscription payments</li>
            <li>To maintain account access and preferences</li>
          </ul>

          <h2 className="text-lg font-semibold">4. Data Storage and Security</h2>
          <p>
            We use a third-party cloud provider to store and manage your synced data. All data is encrypted in
            transit and at rest. Only your account email is stored for identification purposes.
          </p>

          <h2 className="text-lg font-semibold">5. Location and Weather</h2>
          <p>
            When using the weather widget, we request permission to access your device location. This data is used
            locally to show relevant weather information and is not stored or transmitted to our servers.
          </p>

          <h2 className="text-lg font-semibold">6. Payments and Subscriptions</h2>
          <p>
            Payments are processed via Polar, which uses Stripe as its payment processor. We do not store any
            credit card or billing information ourselves. You can cancel your subscription at any time.
          </p>

          <h2 className="text-lg font-semibold">7. Data Sharing</h2>
          <p>We do not sell or share your personal data except when required by law or with your explicit consent.</p>

          <h2 className="text-lg font-semibold">8. Your Rights</h2>
          <ul className="list-disc pl-6">
            <li>Access or export your synced data</li>
            <li>Delete your synced data and account</li>
            <li>Unsubscribe from paid services at any time</li>
          </ul>

          <h2 className="text-lg font-semibold">9. Children's Privacy</h2>
          <p>
            Evolve is not intended for children under 13. We do not knowingly collect personal information from
            children.
          </p>

          <h2 className="text-lg font-semibold">10. Changes</h2>
          <p>
            We may update this Privacy Policy. Material updates will be announced in the extension and/or by email.
            Continued use after changes implies acceptance.
          </p>

          <h2 className="text-lg font-semibold">11. Contact Us</h2>
          <p>If you have any questions or concerns, email us at <a href="mailto:privacy@evolve-app.com" className="text-blue-500 hover:underline">privacy@evolve-app.com</a>.</p>

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
