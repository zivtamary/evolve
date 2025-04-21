import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const motivationalQuotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" }
];

const MotivationPhrase = () => {
  const [quote, setQuote] = useState(motivationalQuotes[0]);

  useEffect(() => {
    // Get today's date as a string (YYYY-MM-DD)
    const today = new Date();
    
    // Check if we already have a quote for today in localStorage
    const evolveData = JSON.parse(localStorage.getItem('evolve_data') || '{}');
    const storedQuoteData = evolveData.dailyQuote;
    
    if (storedQuoteData) {
      const { date, quoteIndex } = JSON.parse(storedQuoteData);
      
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
    evolveData.dailyQuote = JSON.stringify({
      quote: motivationalQuotes[randomIndex].text,
      author: motivationalQuotes[randomIndex].author,
      date: today.toISOString()
    });
    localStorage.setItem('evolve_data', JSON.stringify(evolveData));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative group"
    >
      <motion.div
        className="text-center text-white/90 text-base md:text-lg lg:text-xl font-medium italic max-w-2xl mx-auto py-2 select-none"
      >
        <p className="mb-2">{quote.text}</p>
        <p className="text-white/60 text-sm md:text-base font-normal not-italic">— {quote.author}</p>
      </motion.div>
    </motion.div>
  );
};

export default MotivationPhrase; 