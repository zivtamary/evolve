import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Coffee, Bed } from 'lucide-react';

const TimeGreeting = () => {
  const getGreetingAndIcon = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning, Ziv.",
        icon: <Sun className="w-8 h-8 md:w-10 md:h-10" />
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good afternoon, Ziv.",
        icon: <Coffee className="w-8 h-8 md:w-10 md:h-10" />
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        greeting: "Good evening, Ziv.",
        icon: <Moon className="w-8 h-8 md:w-10 md:h-10" />
      };
    } else {
      return {
        greeting: "Good night, Ziv.",
        icon: <Bed className="w-8 h-8 md:w-10 md:h-10" />
      };
    }
  };

  const { greeting, icon } = getGreetingAndIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center text-white/90 text-2xl md:text-3xl lg:text-4xl font-medium mb-2 flex flex-col items-center gap-2"
    >
      <div className="text-white/90">
        {icon}
      </div>
      {greeting}
    </motion.div>
  );
};

export default TimeGreeting; 