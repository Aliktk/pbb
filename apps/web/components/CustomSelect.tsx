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
  searchable?: boolean;
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
  searchable,
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
  const [openUpward, setOpenUpward] = useState<boolean>(direction === 'up');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;
  const selectedOption = normalizedOptions.find((o) => o.value === selectedValue);

  const isSearchable = searchable ?? normalizedOptions.length > 6;

  // Filter options based on search query
  const filteredOptions = searchQuery.trim()
    ? normalizedOptions.filter(
        (o) =>
          o.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.value.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : normalizedOptions;

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

  // Auto focus search input when opening
  useEffect(() => {
    if (isOpen && isSearchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, isSearchable]);

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
    setSearchQuery('');
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
        <div
          className={`custom-select-dropdown ${openUpward ? 'open-upward' : ''}`}
          role="listbox"
          style={
            openUpward
              ? { bottom: '100%', top: 'auto', marginBottom: '8px', maxHeight: '300px', overflowY: 'auto' }
              : { maxHeight: '300px', overflowY: 'auto' }
          }
        >
          {isSearchable && (
            <div
              style={{
                padding: '8px 10px',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--surf, #ffffff)',
                borderBottom: '1px solid var(--line, #e2e8f0)',
                zIndex: 10,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: '1px solid var(--line, #cbd5e1)',
                  outline: 'none',
                  backgroundColor: 'var(--bg, #f8fafc)',
                  color: 'var(--ink, #0f172a)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
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
            })
          ) : (
            <div style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--mid, #64748b)', textAlign: 'center' }}>
              No matching options
            </div>
          )}
        </div>
      )}
    </div>
  );
}
