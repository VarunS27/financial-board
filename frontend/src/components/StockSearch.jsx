import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const StockSearch = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularStocks, setPopularStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Load popular stocks on mount
  useEffect(() => {
    const loadPopularStocks = async () => {
      try {
        const response = await api.get('/api/stocks/popular');
        setPopularStocks(response.data);
      } catch (error) {
        console.error('Error loading popular stocks:', error);
      }
    };
    loadPopularStocks();
  }, []);

  // Search stocks as user types
  useEffect(() => {
    const searchStocks = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/api/stocks/search?q=${query}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchStocks, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSelectStock(stock);
  };

  const displaySuggestions = query.length >= 2 ? suggestions : popularStocks;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search Indian stocks (e.g., RELIANCE, TCS, INFY...)"
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
        )}
      </div>

      {showSuggestions && displaySuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {query.length < 2 && (
            <div className="px-4 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
              <TrendingUp className="w-4 h-4" />
              Popular Indian Stocks
            </div>
          )}
          {displaySuggestions.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {stock.symbol.replace('.NS', '').replace('.BSE', '')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stock.name}
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {stock.exchange}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearch;