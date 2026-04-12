'use client';

import { useState, useMemo, useEffect } from 'react';
import TimezoneCard from './components/TimezoneCard';
import Clock from './components/Clock';

const DEFAULT_TIMEZONES = [
  { timezone: 'Asia/Kolkata', label: 'India (IST)' },
  { timezone: 'America/New_York', label: 'New York (EST)' },
  { timezone: 'Europe/London', label: 'London (GMT)' },
  { timezone: 'Europe/Paris', label: 'Paris (CET)' },
  { timezone: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { timezone: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { timezone: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { timezone: 'Asia/Dubai', label: 'Dubai (GST)' },
  { timezone: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { timezone: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { timezone: 'America/Chicago', label: 'Chicago (CST)' },
  { timezone: 'Europe/Berlin', label: 'Berlin (CET)' },
  { timezone: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { timezone: 'Australia/Melbourne', label: 'Melbourne (AEDT)' },
  { timezone: 'America/Toronto', label: 'Toronto (EST)' },
  { timezone: 'Europe/Amsterdam', label: 'Amsterdam (CET)' },
  { timezone: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { timezone: 'America/Mexico_City', label: 'Mexico City (CST)' },
  { timezone: 'Europe/Istanbul', label: 'Istanbul (EET)' },
  { timezone: 'Asia/Karachi', label: 'Karachi (PKT)' },
];

interface TimezoneItem {
  timezone: string;
  label: string;
}

export default function Home() {
  const [timezones, setTimezones] = useState<TimezoneItem[]>(DEFAULT_TIMEZONES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTime, setFilterTime] = useState<string>('');
  const [timeComparison, setTimeComparison] = useState<'before' | 'after' | 'at'>('before');
  const [timeHour, setTimeHour] = useState<string>('13');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newTzName, setNewTzName] = useState('');
  const [newTzLabel, setNewTzLabel] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update time every second for real-time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('timezones');
    if (saved) {
      try {
        const savedTimezones = JSON.parse(saved);
        // Merge saved timezones with default ones, keeping custom timezones
        const customTimezones = savedTimezones.filter(
          (tz: TimezoneItem) => !DEFAULT_TIMEZONES.some((dt) => dt.timezone === tz.timezone)
        );
        setTimezones([...DEFAULT_TIMEZONES, ...customTimezones]);
      } catch (e) {
        console.error('Failed to load timezones:', e);
        setTimezones(DEFAULT_TIMEZONES);
      }
    }
  }, []);

  // Save to localStorage whenever timezones change
  useEffect(() => {
    localStorage.setItem('timezones', JSON.stringify(timezones));
  }, [timezones]);

  const addTimezone = () => {
    if (!newTzName.trim() || !newTzLabel.trim()) {
      alert('Please fill in both timezone and label');
      return;
    }

    // Validate timezone by trying to format a date
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: newTzName });
      setTimezones([...timezones, { timezone: newTzName, label: newTzLabel }]);
      setNewTzName('');
      setNewTzLabel('');
      setShowAddForm(false);
    } catch (e) {
      alert('Invalid timezone format. Try: Asia/Kolkata, America/New_York, etc.');
    }
  };

  const removeTimezone = (timezone: string) => {
    setTimezones(timezones.filter((tz) => tz.timezone !== timezone));
  };

  const resetToDefault = () => {
    if (confirm('Reset all timezones to default?')) {
      setTimezones(DEFAULT_TIMEZONES);
    }
  };

  const getHourFromTimezone = (timezone: string): number => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === 'hour');
    return parseInt(hourPart?.value || '0');
  };

  const filteredAndSortedTimezones = useMemo(() => {
    let result = [...timezones];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tz) =>
          tz.label.toLowerCase().includes(query) ||
          tz.timezone.toLowerCase().includes(query)
      );
      // Only reverse if searching
      result.reverse();
    } else {
      // Sort by time of day (morning first, then through evening)
      result.sort((a, b) => {
        const hourA = getHourFromTimezone(a.timezone);
        const hourB = getHourFromTimezone(b.timezone);
        return hourA - hourB;
      });
    }

    return result;
  }, [searchQuery, timezones]);

  const displayedTimezones = useMemo(() => {
    if (!filterTime) {
      return filteredAndSortedTimezones;
    }

    const targetHour = parseInt(timeHour);
    return filteredAndSortedTimezones.filter((tz) => {
      const tzHour = getHourFromTimezone(tz.timezone);
      if (timeComparison === 'before') return tzHour <= targetHour;
      if (timeComparison === 'after') return tzHour >= targetHour;
      if (timeComparison === 'at') return tzHour === targetHour;
      return true;
    });
  }, [filteredAndSortedTimezones, filterTime, timeComparison, timeHour]);

  return (
    <div className="flex flex-col flex-1 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
      <main className="flex-1 max-w-7xl w-full mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">World Timezone Clock</h1>
          <p className="text-lg text-gray-600">
            Check current time across different timezones with interactive clocks
          </p>
        </div>

        {/* Search and Filter Side by Side */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by city or timezone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white text-gray-900 text-base"
            />
          </div>

          {/* Time Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Time Filter</label>
            <div className="flex gap-2">
              <select
                value={timeComparison}
                onChange={(e) => setTimeComparison(e.target.value as 'before' | 'after' | 'at')}
                className="flex-1 px-3 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm font-medium cursor-pointer"
              >
                <option value="before">≤ (Before/At)</option>
                <option value="after">≥ (After/At)</option>
                <option value="at">= (Exactly)</option>
              </select>

              <select
                value={timeHour}
                onChange={(e) => setTimeHour(e.target.value)}
                className="flex-1 px-3 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm font-medium cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i).padStart(2, '0')}>
                    {String(i).padStart(2, '0')}:00 - {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setFilterTime(filterTime ? '' : 'active')}
                className={`px-4 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filterTime
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                {filterTime ? 'Active' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* View Mode and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Line View
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-all"
            >
              + Add Timezone
            </button>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Add Timezone Form */}
        {showAddForm && (
          <div className="mb-6 bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Timezone</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Timezone (e.g., Asia/Kolkata)"
                value={newTzName}
                onChange={(e) => setNewTzName(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
              <input
                type="text"
                placeholder="Label (e.g., India)"
                value={newTzLabel}
                onChange={(e) => setNewTzLabel(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
              <div className="flex gap-2">
                <button
                  onClick={addTimezone}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {(searchQuery || filterTime) && (
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Showing {displayedTimezones.length} of {timezones.length} timezones
          </p>
        )}

        {displayedTimezones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No timezones match your search or filter criteria.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedTimezones.map(({ timezone, label }) => (
              <div key={timezone} className="relative">
                <TimezoneCard timezone={timezone} label={label} />
                {!DEFAULT_TIMEZONES.some((tz) => tz.timezone === timezone) && (
                  <button
                    onClick={() => removeTimezone(timezone)}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all"
                    title="Remove custom timezone"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayedTimezones.map(({ timezone, label }) => {
              const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              });
              const timeStr = formatter.format(currentTime);

              const dateFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              const dateStr = dateFormatter.format(currentTime);

              const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }).formatToParts(currentTime);

              const clockDate = new Date();
              for (const part of parts) {
                if (part.type === 'hour') clockDate.setHours(parseInt(part.value));
                if (part.type === 'minute') clockDate.setMinutes(parseInt(part.value));
                if (part.type === 'second') clockDate.setSeconds(parseInt(part.value));
              }

              return (
                <div
                  key={timezone}
                  className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow flex items-center justify-between gap-6 relative"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <Clock date={clockDate} />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{label}</h3>
                      <p className="text-sm text-gray-600 mb-2">{timezone}</p>
                      <p className="text-2xl font-mono font-bold text-blue-600">{timeStr}</p>
                      <p className="text-sm text-gray-500">{dateStr}</p>
                    </div>
                  </div>
                  {!DEFAULT_TIMEZONES.some((tz) => tz.timezone === timezone) && (
                    <button
                      onClick={() => removeTimezone(timezone)}
                      className="shrink-0 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold transition-all"
                      title="Remove custom timezone"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
