"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const PlayStoreScraper = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };
  };

  const searchApps = async (query) => {
    if (!query) {
      setApps([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/search?query=${query}`);
      const data = await response.json();
      setApps(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = React.useCallback(
    debounce((query) => searchApps(query), 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 bg-black p-4 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Google Play Store Scraper</h1>
        <div className="relative">
          <div className="flex items-center border rounded overflow-hidden">
            <Search className="w-5 h-5 ml-3 text-gray-400" />
            <input
              type="text"
              placeholder="Ketik untuk mencari aplikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=" text-white flex-1 p-3 pl-2 outline-none bg-black"
            />
            {loading && (
              <div className="mr-3 text-sm text-gray-500">
                Searching...
              </div>
            )}
          </div>
        </div>
      </div>

      {apps.length > 0 && (
        <div className="grid gap-4">
          {apps.map((app) => (
            <div 
              key={app.appId || Math.random()} 
              className="bg-black p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex gap-4">
                {app.icon && (
                  <img 
                    src={app.icon} 
                    alt={app.title || 'App icon'} 
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{app.title || 'Unnamed App'}</h2>
                  <p className="text-sm text-gray-500">{app.developer || 'Unknown Developer'}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm font-medium">
                      {typeof app.score === 'number' ? app.score.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-yellow-400 ml-1">⭐</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({app.price || 'Free'})
                    </span>
                  </div>
                </div>
              </div>
              {app.summary && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {app.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && apps.length === 0 && searchQuery && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No apps found. Try another search.</p>
        </div>
      )}
    </div>
  );
};

export default PlayStoreScraper;