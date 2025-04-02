
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/context/SettingsContext';
import { toast } from '@/components/ui/use-toast';

const SubscriptionToggle = () => {
  const { userProfile, setUserProfile } = useSettings();

  const handleTogglePremium = () => {
    const newStatus = !userProfile?.isPremium;
    
    setUserProfile({
      ...userProfile!,
      isPremium: newStatus
    });
    
    toast({
      title: newStatus ? "Premium Activated" : "Premium Deactivated",
      description: newStatus 
        ? "You now have access to premium features!" 
        : "Premium features are now disabled.",
      variant: newStatus ? "default" : "destructive"
    });
  };

  return (
    <Switch 
      checked={userProfile?.isPremium || false} 
      onCheckedChange={handleTogglePremium}
    />
  );
};

export default SubscriptionToggle;
