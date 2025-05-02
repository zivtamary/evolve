import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const motivationalQuotes = [
  { en: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { en: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { en: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { en: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { en: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { en: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { en: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { en: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { en: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { en: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { en: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { en: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { en: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { en: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { en: "The mind is everything. What you think you become.", author: "Buddha" },
  { en: "Small steps lead to big achievements.", author: "Unknown" },
  { en: "Every day is a new beginning.", author: "Unknown" },
  { en: "Progress, not perfection.", author: "Unknown" },
  { en: "You are stronger than you think.", author: "Unknown" },
  { en: "Dream big, start small.", author: "Unknown" },
  { en: "Be the change you wish to see.", author: "Mahatma Gandhi" },
  { en: "Life is 10% what happens and 90% how you react.", author: "Charles R. Swindoll" },
  { en: "The only failure is not trying.", author: "Unknown" },
  { en: "Your potential is endless.", author: "Unknown" },
  { en: "Make today count.", author: "Unknown" },
  { en: "Growth happens outside your comfort zone.", author: "Unknown" },
  { en: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { en: "You are capable of amazing things.", author: "Unknown" },
  { en: "Success starts with self-belief.", author: "Unknown" },
  { en: "The best is yet to come.", author: "Unknown" },
  { en: "Turn your dreams into plans.", author: "Unknown" },
  { en: "Be the reason someone smiles today.", author: "Unknown" },
  { en: "Your attitude determines your direction.", author: "Unknown" },
  { en: "Great things take time.", author: "Unknown" },
  { en: "Stay focused, stay positive.", author: "Unknown" },
  { en: "You are your only limit.", author: "Unknown" },
  { en: "Make it happen.", author: "Unknown" },
  { en: "Progress over perfection.", author: "Unknown" },
  { en: "Today is your day.", author: "Unknown" },
  { en: "Believe in your journey.", author: "Unknown" },
  { en: "You've got this.", author: "Unknown" },
  { en: "Rise and shine.", author: "Unknown" },
  { en: "Make today amazing.", author: "Unknown" },
  { en: "Dream, believe, achieve.", author: "Unknown" },
  { en: "Be unstoppable.", author: "Unknown" },
  { en: "Your time is now.", author: "Unknown" },
  { en: "Create your own sunshine.", author: "Unknown" },
  { en: "Be the energy you want to attract.", author: "Unknown" },
  { en: "Every day is a gift.", author: "Unknown" },
  { en: "Make it count.", author: "Unknown" },
  { en: "You are enough.", author: "Unknown" }
];

const MotivationPhrase = () => {
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const { language, setLanguage, t } = useLanguage();

  // Check if we already have a quote for today in localStorage
  const evolveData = JSON.parse(localStorage.getItem('evolve_data') || '{}');
  const storedQuoteData = evolveData?.dailyQuote;
  
  useEffect(() => {
    // Get today's date as a string (YYYY-MM-DD)
    const today = new Date();
    
    if (storedQuoteData) {
      const { date, quoteIndex } = storedQuoteData;
      
      // If the stored quote is from today, use it
      if (date === today.toISOString().split('T')[0]) {
        setQuote(motivationalQuotes[quoteIndex]);
        return;
      }
    }
    
    // Otherwise, get a new random quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
    
    // Store the new quote and today's date in localStorage
    evolveData.dailyQuote = {
      quote: motivationalQuotes[randomIndex][language],
      author: motivationalQuotes[randomIndex].author,
      date: today.toISOString(),
      show: "show" in evolveData.dailyQuote ? evolveData.dailyQuote.show : true
    };
    localStorage.setItem('evolve_data', JSON.stringify(evolveData));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      style={{ display: storedQuoteData?.show !== false ? 'block' : 'none' }}
      className="relative group"
    >
      <motion.div
        className="text-center text-white/90 text-base md:text-lg lg:text-xl font-medium italic max-w-2xl mx-auto py-2 select-none"
      >
        <p className="mb-2">{quote[language]}</p>
       {quote.author && quote.author !== 'Unknown' && <p className="text-white/60 text-sm md:text-base font-normal not-italic">— {quote.author}</p>}
      </motion.div>
    </motion.div>
  );
};

export default MotivationPhrase; 