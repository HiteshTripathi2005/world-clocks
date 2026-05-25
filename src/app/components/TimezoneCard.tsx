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
    <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex items-stretch gap-4">
        {/* Clock - Left */}
        <div className="flex items-center justify-center flex-shrink-0">
          <Clock date={getClockDate()} />
        </div>

        {/* Text Content - Right */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">{label}</h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <p className="text-sm text-gray-600 truncate">{timezone}</p>
              <button
                onClick={copyToClipboard}
                title="Copy timezone"
                className={`px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white active:scale-95'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-lg font-mono font-bold text-blue-600 leading-tight">{getTimezoneTime()}</p>
            <p className="text-xs text-gray-500">{getTimezoneDate()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
