'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  name: string;
  options: readonly (string | CustomSelectOption)[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  direction?: 'down' | 'up' | 'auto';
}

export function CustomSelect({
  name,
  options,
  value: controlledValue,
  defaultValue,
  placeholder = 'Select option...',
  required = false,
  onChange,
  className = '',
  direction = 'down',
}: CustomSelectProps) {
  // Normalize options to { value, label } format
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  );

  const initialVal =
    controlledValue !== undefined
      ? controlledValue
      : defaultValue !== undefined
      ? defaultValue
      : normalizedOptions[0]?.value ?? '';

  const [internalValue, setInternalValue] = useState<string>(initialVal);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openUpward, setOpenUpward] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;
  const selectedOption = normalizedOptions.find((o) => o.value === selectedValue);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!isOpen && containerRef.current) {
      if (direction === 'up') {
        setOpenUpward(true);
      } else if (direction === 'auto') {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpward(spaceBelow < 320);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen((prev) => !prev);
  }

  function handleSelect(optValue: string) {
    if (controlledValue === undefined) {
      setInternalValue(optValue);
    }
    setIsOpen(false);
    if (onChange) onChange(optValue);
  }

  return (
    <div
      className={`custom-select-container ${className}`}
      ref={containerRef}
      style={{ position: 'relative', zIndex: isOpen ? 999 : 1 }}
    >
      {/* Hidden native input for HTML form submissions */}
      <input type="hidden" name={name} value={selectedValue} required={required} />

      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`cs-value-text ${!selectedOption ? 'cs-placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`cs-chevron ${isOpen ? 'open' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`custom-select-dropdown ${openUpward ? 'open-upward' : ''}`} role="listbox">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <div
                key={opt.value}
                className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
                role="option"
                aria-selected={isSelected}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
