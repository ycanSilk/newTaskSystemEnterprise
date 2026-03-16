import React from 'react';
import { cn } from '@/lib/utils';
import { ToggleSwitchProps } from '@/types';

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  className,
  activeColor = 'bg-blue-500',
  inactiveColor = 'bg-gray-300',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <div 
      className={cn(
        'flex items-center space-x-2',
        disabled && 'opacity-50',
        className
      )}
    >
      {label && (
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only peer"
          id={`toggle-${Math.random().toString(36).substr(2, 9)}`}
        />
        <div 
          className={cn(
            'block w-11 h-6 rounded-full peer-focus:outline-none transition-colors duration-300 ease-in-out',
            checked ? activeColor : inactiveColor,
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        />
        <div 
          className={cn(
            'dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ease-in-out',
            checked ? 'transform translate-x-5' : 'transform translate-x-0'
          )}
        />
      </div>
    </div>
  );
};