import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, MessageCircle, MessageCircleHeart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/context/SettingsContext';
import { PostgrestError } from '@supabase/supabase-js';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '@/context/LanguageContext';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onOpenChange }) => {
  const [feedback, setFeedback] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { isAuthenticated } = useSettings();
  const { t } = useLanguage();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!isAuthenticated) {
        throw new Error('You must be signed in to submit feedback');
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not found');
      }

      const { error: insertError } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          content: feedback,
          category: 'general'
        });

      if (insertError) {
        // Handle rate limit error
        if (insertError.message.includes('Rate limit exceeded')) {
          throw new Error(insertError.message);
        }
        throw insertError;
      }
      
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFeedback('');
      
      // Close the dialog after 2 seconds
      setTimeout(() => {
        onOpenChange(false);
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      let errorMessage = 'An unknown error occurred';
      
      if (err instanceof Error) {
        // Format rate limit error message
        if (err.message.includes('Rate limit exceeded')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      } else if ((err as PostgrestError)?.message) {
        errorMessage = (err as PostgrestError).message;
      }
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeButtonClassName='text-black dark:text-white' className="bg-white dark:bg-black border-white/10 shadow-xl font-['Inter']">
        <DialogHeader className="border-b border-white/10 pb-3">
          <DialogTitle className="dark:text-white text-xl font-semibold flex items-center gap-2">
            <MessageCircleHeart className="h-5 w-5" />
            {t('leaveFeedback')}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {t('feedbackDescription')}
          </DialogDescription>
        </DialogHeader>
        
        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="text-green-500 text-lg font-medium">{t('thankYouForFeedback')}</div>
            <div className="text-gray-500 dark:text-white/70 text-sm mt-2">{t('weAppreciateYourInput')}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="feedback" className="text-sm dark:text-white/80 font-medium">{t('yourFeedback')}</label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-32 dark:bg-black/20 dark:border-white/10"
                placeholder={t('feedbackPlaceholder')}
                required
              />
            </div>
            
            <DialogFooter className="border-t border-white/10 pt-4 mt-2">
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white transition-all duration-300 animate-gradient-x"
                  disabled={isSubmitting || !feedback.trim()}
                >
                  <span className="relative z-10 flex items-center">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('submitting')}
                      </>
                    ) : (
                      t('submitFeedback')
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog; 