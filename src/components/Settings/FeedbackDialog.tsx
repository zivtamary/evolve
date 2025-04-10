import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/context/SettingsContext';
import { PostgrestError } from '@supabase/supabase-js';

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
      <DialogContent className="glass dark:glass-dark border-white/10 backdrop-blur-md shadow-xl">
        <DialogHeader className="border-b border-white/10 pb-3">
          <DialogTitle className="text-white text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Leave Feedback
          </DialogTitle>
          <DialogDescription className="text-white/70 text-sm mt-1">
            Your feedback is invaluable to us! It helps us understand your needs, improve our features, and create a better experience for everyone. We read every submission and use your insights to shape the future of Evolve.
          </DialogDescription>
        </DialogHeader>
        
        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="text-green-500 text-lg font-medium">Thank you for your feedback!</div>
            <div className="text-white/70 text-sm mt-2">We appreciate your input and will review it shortly.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm text-white/80 font-medium">Your Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full h-32 bg-black/10 dark:bg-black/20 px-4 py-2.5 rounded-lg outline-none border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all duration-200 text-white placeholder-white/40 resize-none"
                placeholder="Share your thoughts, suggestions, or report issues..."
                required
              />
            </div>
            
            <DialogFooter className="border-t border-white/10 pt-4 mt-2">
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
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
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
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