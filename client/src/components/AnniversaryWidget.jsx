import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, Sparkles, Flame, Infinity as InfinityIcon } from 'lucide-react';

export const AnniversaryWidget = ({ gradient = 'from-rose-500 via-pink-600 to-rose-700' }) => {
  // Official relationship start date: September 10, 2020 (10/09/2020)
  const [startDateStr] = useState('2020-09-10T00:00:00');
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    years: 0,
    months: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      // Approximate years and months
      const years = Math.floor(days / 365.25);
      const remainingDays = days - Math.floor(years * 365.25);
      const months = Math.floor(remainingDays / 30.44);

      setElapsed({ days, hours, minutes, seconds, years, months });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${gradient} text-white shadow-romantic transition-all duration-700`}
    >
      {/* Decorative blurred backdrop glow */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-rose-100 border border-white/20 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              In Love Since 10/09/2020 • {elapsed.years} Years &amp; {elapsed.months} Months
            </motion.span>
          </div>
          <h3 className="text-xl sm:text-3xl font-serif font-black tracking-tight drop-shadow-sm">
            Ashis &amp; Kirti — Forever &amp; Always
          </h3>
          <p className="text-xs sm:text-sm text-rose-100/90 mt-1 max-w-md font-serif italic">
            "{elapsed.days.toLocaleString()} glorious days of holding hands, growing together, and loving you more each second."
          </p>
        </div>

        {/* Live Counters with Framer Motion hover elevation */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center self-stretch sm:self-auto">
          {[
            { value: elapsed.days.toLocaleString(), label: 'Days', isPulse: false },
            { value: elapsed.hours, label: 'Hours', isPulse: false },
            { value: elapsed.minutes, label: 'Mins', isPulse: false },
            { value: elapsed.seconds, label: 'Secs', isPulse: true },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.1, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="p-2 sm:p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm cursor-pointer"
            >
              <div className={`text-lg sm:text-2xl md:text-3xl font-bold font-serif ${item.isPulse ? 'text-amber-200 animate-pulse' : ''}`}>
                {item.value}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-rose-200 font-bold mt-0.5">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
