import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Database } from '../integrations/supabase/types';

type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  current_period_end: string;
}

export default function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile } = useSettings();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    // Handle success/cancel status
    const status = searchParams.get('status');
    if (status === 'success') {
      toast.success('Subscription activated successfully!');
      navigate('/settings', { replace: true });
    } else if (status === 'canceled') {
      toast.error('Subscription process was canceled');
      navigate('/settings', { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch subscription plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });

        if (plansError) throw plansError;
        setPlans(plansData);

        // Fetch user's subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userProfile?.id)
          .single();

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          throw subscriptionError;
        }
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast.error('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile?.id]);

  const handleSubscribe = async (planId: string) => {
    try {
      setCheckoutLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan_id: planId }
      });

      if (error) throw error;

      // Redirect to Polar checkout
      window.location.href = data.checkout_url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Settings</h1>

      {/* Current Subscription Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            Your current subscription status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                  {subscription.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Valid until {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No active subscription</p>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.description}
              </CardDescription>
              <div className="text-2xl font-bold">
                ${plan.price}
                <span className="text-sm text-muted-foreground">
                  /{plan.interval}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Data Synchronization
                </li>
                {/* Add more features as needed */}
              </ul>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.id)}
                disabled={checkoutLoading || subscription?.status === 'active'}
              >
                {checkoutLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {subscription?.status === 'active' ? 'Current Plan' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 