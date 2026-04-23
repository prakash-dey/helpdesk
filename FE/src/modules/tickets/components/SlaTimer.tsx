import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SlaTimer({ breachAt }: { breachAt?: string }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!breachAt) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(interval);
  }, [breachAt]);

  if (!breachAt) return null;

  const breachDate = new Date(breachAt);
  const isBreached = breachDate < new Date();

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${isBreached ? 'text-red-600' : 'text-yellow-600'}`}>
      {isBreached ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {isBreached
        ? `SLA breached ${formatDistanceToNow(breachDate, { addSuffix: true })}`
        : `SLA due ${formatDistanceToNow(breachDate, { addSuffix: true })}`}
    </span>
  );
}
