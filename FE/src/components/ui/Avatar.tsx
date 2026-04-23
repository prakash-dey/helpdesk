import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const colors = [
  'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length]!;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full font-semibold ${sizeMap[size]} ${getColor(name)} ${className}`}>
      {getInitials(name)}
    </span>
  );
}
