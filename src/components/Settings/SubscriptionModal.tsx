import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Sparkles,
  Check,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SubscriptionPlan =
  Database["public"]["Tables"]["subscription_plans"]["Row"];

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile } = useSettings();
  const { t } = useLanguage();
  const calculateSavings = (yearlyPrice: number, monthlyPrice: number) => {
    const monthlyCost = monthlyPrice * 12; // Cost if paid monthly for a year
    const savings = monthlyCost - yearlyPrice; // Total savings in dollars
    const savingsPercentage = (savings / yearlyPrice) * 100; // Savings as percentage of yearly price
    return Math.round(savingsPercentage);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedPlan(null);
      setPlans([]);
      setIsLoading(true);
    }
  }, [open]);

  useEffect(() => {
    let isMounted = true;

    const fetchPlans = async () => {
      try {
        setError(null);
        // console.log("Fetching subscription plans...");
        const { data: plansData, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .neq('price', 0)
          .order('price', { ascending: true });

        if (error) throw error;
        if (isMounted) {
          // console.log("Setting subscription plans:", plansData);
          setPlans(plansData);

          // Select the yearly plan by default
          const yearlyPlan = plansData.find((plan) => plan.interval === "year");
          if (yearlyPlan) {
            setSelectedPlan(yearlyPlan.id);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        if (isMounted) {
          setError("Failed to load subscription plans. Please try again later.");
          setIsLoading(false);
        }
      }
    };

    if (open) {
      fetchPlans();
    }

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }

    try {
      setError(null);
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: { plan_id: selectedPlan },
        }
      );

      // console.log("Data:", data);

      if (error) {
        setError("Failed to create checkout session. Please try again later.");
        setIsProcessing(false);
        return;
      }

      if (data.checkout_url) {
          window.location.href = data.checkout_url;
      } else {
        setError("Failed to create checkout session. Please try again later.");
        setIsProcessing(false);
      }

      // Redirect to Polar checkout
    } catch (error) {
      console.error("Error creating checkout:", error);
      setError("An unexpected error occurred. Please try again later.");
      setIsProcessing(false);
    }
  };

  const benefits = [
    t('cloudSynchronization'),
    t('earlyAccessToNewFeatures'),
    t('noAdsOrInteruptions'),
    t('prioritySupport'),
  ];

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-background font-['Inter']">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              <Skeleton className="h-4 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700" />
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {[1, 2].map((index) => (
              <div key={index} className="border rounded-lg p-4">
                <Skeleton className="h-5 w-24 mb-2 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-8 w-16 mb-1 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-start gap-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-2">
            <Skeleton className="h-10 w-full sm:w-24 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-full sm:w-32 bg-gray-200 dark:bg-gray-700" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background font-['Inter']">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            {t('upgradeToPremium')}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t('premiumDescription')}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 py-4">
          {plans.map((plan) => {
            const monthlyPlan = plans.find(p => p.interval === "month");
            const yearlyPlan = plans.find(p => p.interval === "year");
            const savings = plan.interval === "year" && monthlyPlan 
              ? calculateSavings(plan.price, monthlyPlan.price)
              : 0;

            return (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all relative ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "hover:border-gray-400"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {savings > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save {savings}%
                  </div>
                )}
                <div className="font-semibold mb-1">{plan.name}</div>
                <div className="text-2xl font-bold">${plan.price}</div>
                <div className="text-sm text-muted-foreground">
                  per {plan.interval}
                </div>
                {plan.description && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {plan.description}
                  </div>
                )}
              </div>
            );
          })}
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
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubscribe}
            className="sm:w-auto w-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:shadow-indigo-500/20 shadow-indigo-500/20 dark:hover:shadow-indigo-500/30 hover:from-indigo-600 hover:to-purple-600"
            disabled={isProcessing || !selectedPlan}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                {t('subscribeNow')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
