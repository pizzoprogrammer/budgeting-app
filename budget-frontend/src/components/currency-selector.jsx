import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_CURRENCIES } from '@/lib/utils';
import { Search, X } from 'lucide-react';

export function CurrencySelector({ value, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const filtered = SUPPORTED_CURRENCIES.filter(curr =>
    curr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    curr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 text-left flex items-center justify-between"
      >
        <span>
          {selectedCurrency ? `${selectedCurrency.code} - ${selectedCurrency.name}` : 'Select currency'}
        </span>
        <span className="text-sm">{selectedCurrency?.symbol}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-lg z-50">
          {/* Search Input */}
          <div className="p-2 border-b dark:border-gray-600">
            <div className="flex items-center gap-2 px-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search currency..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 px-2 py-1 rounded bg-gray-50 dark:bg-gray-600 dark:text-white outline-none"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Currency List */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                No currencies found
              </div>
            ) : (
              filtered.map(curr => (
                <button
                  type="button"
                  key={curr.code}
                  onClick={() => {
                    onChange(curr.code);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    value === curr.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div>
                    <div className="font-medium dark:text-white">{curr.code}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{curr.name}</div>
                  </div>
                  <span className="text-lg">{curr.symbol}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
