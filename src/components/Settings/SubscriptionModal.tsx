
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, Check, CreditCard, Loader2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { toast } from '@/components/ui/use-toast';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onOpenChange }) => {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { setUserProfile, userProfile } = useSettings();

  const handleSubscribe = () => {
    setIsProcessing(true);
    
    // Mock subscription process
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Update user profile with premium status
      setUserProfile({
        ...userProfile!,
        isPremium: true
      });
      
      toast({
        title: "Subscription Successful",
        description: `Your ${plan} subscription has been activated.`,
        variant: "default"
      });
      
      // Close modal after showing success state
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
      }, 2000);
    }, 2000);
  };

  const benefits = [
    "Cloud synchronization across devices",
    "Unlimited notes and todos",
    "Priority support",
    "Early access to new features",
    "No ads or interruptions"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Payment Successful!</h3>
            <p className="text-center text-muted-foreground mt-2">
              Your {plan} subscription has been activated.
              Thank you for upgrading to premium!
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Upgrade to Premium
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                Unlock all features and sync your data across devices.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  plan === 'monthly' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setPlan('monthly')}
              >
                <div className="font-semibold mb-1">Monthly</div>
                <div className="text-2xl font-bold">$5</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                  plan === 'yearly' 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'hover:border-gray-400'
                }`}
                onClick={() => setPlan('yearly')}
              >
                {plan === 'yearly' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 17%
                  </div>
                )}
                <div className="font-semibold mb-1">Yearly</div>
                <div className="text-2xl font-bold">$50</div>
                <div className="text-sm text-muted-foreground">per year</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Premium Benefits:</h4>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="sm:w-auto w-full"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubscribe}
                className="sm:w-auto w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
