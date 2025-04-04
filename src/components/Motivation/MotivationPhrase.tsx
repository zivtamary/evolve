import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const motivationalQuotes = [
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It always seems impossible until it's done.",
  "Your time is limited, don't waste it living someone else's life.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "Do what you can, with what you have, where you are.",
  "The journey of a thousand miles begins with one step."
];

const MotivationPhrase = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Get a random quote on component mount
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="text-center text-white/90 text-base md:text-lg lg:text-xl font-medium italic max-w-2xl mx-auto px-4"
    >
      "{quote}"
    </motion.div>
  );
};

export default MotivationPhrase; 