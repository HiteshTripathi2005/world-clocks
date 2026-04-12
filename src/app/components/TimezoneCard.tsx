'use client';

import { useEffect, useState } from 'react';
import Clock from './Clock';

interface TimezoneCardProps {
  timezone: string;
  label: string;
}

export default function TimezoneCard({ timezone, label }: TimezoneCardProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimezoneTime = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return formatter.format(date);
  };

  const getTimezoneDate = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return formatter.format(date);
  };

  const getClockDate = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const dateObj = new Date();

    for (const part of parts) {
      if (part.type === 'hour') dateObj.setHours(parseInt(part.value));
      if (part.type === 'minute') dateObj.setMinutes(parseInt(part.value));
      if (part.type === 'second') dateObj.setSeconds(parseInt(part.value));
    }

    return dateObj;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(timezone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-stretch gap-3">
        {/* Clock - Left */}
        <div className="flex items-center justify-center">
          <Clock date={getClockDate()} />
        </div>

        {/* Text Content - Right */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">{label}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-gray-600">{timezone}</p>
              <button
                onClick={copyToClipboard}
                title="Copy timezone"
                className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all duration-200 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 active:scale-95'
                }`}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
          <div>
            <p className="text-lg font-mono font-bold text-blue-600 leading-tight">{getTimezoneTime()}</p>
            <p className="text-xs text-gray-500">{getTimezoneDate()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
