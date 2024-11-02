"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const PlayStoreScraper = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mediaContent, setMediaContent] = useState(null);

  const toggleDescription = (appId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const formatDescription = (description) => {
    if (!description) return '';
    return description.split(/<br\s*\/?>/gi).map((part, index) => {
      const colorMatch = part.match(/<font color="([^"]+)">(.*?)<\/font>/);
      if (colorMatch) {
        return (
          <React.Fragment key={index}>
            <span style={{ color: colorMatch[1] }}>{colorMatch[2]}</span>
            {index < description.split(/<br\s*\/?>/gi).length - 1 && <br />}
          </React.Fragment>
        );
      }
      return (
        <React.Fragment key={index}>
          {part}
          {index < description.split(/<br\s*\/?>/gi).length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

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
      setApps(data.map(app => ({
        ...app,
        mediaContent: null
      })));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppMediaContent = async (appId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/app-media?appId=${appId}`);
      const data = await response.json();
      return {
        screenshots: data.screenshots || [],
        trailerUrl: data.trailerUrl || null,
        bannerImage: data.bannerImage || null
      };
    } catch (error) {
      console.error('Error fetching media content:', error);
      return null;
    }
  };

  const debouncedSearch = React.useCallback(
    debounce((query) => searchApps(query), 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleAppClick = async (app) => {
    setSelectedApp(app);
    setIsPlaying(false);
    setIsMuted(true);
    
    // Fetch media content when app is selected
    const content = await fetchAppMediaContent(app.appId);
    if (content) {
      setMediaContent(content);
    }
  };

  const handleBack = () => {
    setSelectedApp(null);
    setIsPlaying(false);
    setMediaContent(null);
  };

  const togglePlayPause = () => {
    const video = document.getElementById('app-trailer');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('app-trailer');
    if (video) {
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    }
  };

  const AppBanner = ({ app }) => {
    if (!mediaContent) {
      return (
        <div className="w-full h-[380px] bg-gradient-to-b from-gray-800 to-gray-900" />
      );
    }

    const { trailerUrl, screenshots, bannerImage } = mediaContent;
    const hasTrailer = trailerUrl && trailerUrl.trim() !== '';

    return (
      <div className="w-full h-[380px] bg-gray-900 relative overflow-hidden">
        {hasTrailer ? (
          <div className="relative w-full h-full">
            <video
              id="app-trailer"
              className="w-full h-full object-cover"
              poster={screenshots?.[0] || bannerImage}
              muted={isMuted}
              loop
            >
              <source src={trailerUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <div className="absolute bottom-4 left-4 flex items-center gap-4">
              <button
                onClick={togglePlayPause}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        ) : bannerImage ? (
          <img 
            src={bannerImage}
            alt="App banner"
            className="w-full h-full object-cover"
          />
        ) : screenshots && screenshots.length > 0 ? (
          <img 
            src={screenshots[0]}
            alt="App screenshot"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Only show in list view */}
      {!selectedApp && (
        <div className="w-full bg-white border-b shadow-sm fixed top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-4">
              {/* Google Play Logo */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-normal text-gray-700">Play Analyst</span>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-4xl">
                <div className="relative">
                  <div className="flex items-center bg-[#f1f3f4] rounded-lg hover:bg-gray-100 hover:shadow-sm transition-all">
                    <Search className="w-5 h-5 ml-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search for apps & games"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-3 px-4 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                    />
                    {loading && (
                      <div className="mr-4 text-sm text-gray-500">
                        Searching...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={!selectedApp ? "pt-16" : ""}>
        {/* App List View */}
        {!selectedApp && apps.length > 0 && (
          <div className="grid gap-4 p-4 max-w-7xl mx-auto">
            {apps.map((app) => (
              <div 
                key={app.appId || Math.random()} 
                className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => handleAppClick(app)}
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
                    <h2 className="text-lg font-semibold text-gray-900">{app.title || 'Unnamed App'}</h2>
                    <p className="text-sm text-gray-500">{app.developer || 'Unknown Developer'}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-black text-sm font-medium">
                        {typeof app.score === 'number' ? app.score.toFixed(1) : 'N/A'}
                      </span>
                      <span className="text-yellow-400 ml-1">⭐</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({app.downloads || '10M+'} downloads)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed App View */}
        {selectedApp && (
          <div className="min-h-screen bg-white">
            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="fixed top-4 left-4 z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>

            {/* App Banner with Video Support */}
            <AppBanner app={selectedApp} />

            {/* App Info */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 relative">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex gap-4">
                  <img 
                    src={selectedApp.icon} 
                    alt={selectedApp.title}
                    className="w-24 h-24 rounded-lg shadow-md"
                  />
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{selectedApp.title}</h1>
                    <p className="text-sm text-green-600 mt-1">{selectedApp.developer}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center">
                        <span className="text-lg font-medium">{selectedApp.score?.toFixed(1) || 'N/A'}</span>
                        <span className="text-yellow-400 ml-1">⭐</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {selectedApp.downloads || '10M+'} downloads
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">About this app</h2>
                  <div className={`text-gray-600 ${!expandedDescriptions[selectedApp.appId] ? 'line-clamp-3' : ''}`}>
                    {formatDescription(selectedApp.summary)}
                  </div>
                  <button
                    onClick={() => toggleDescription(selectedApp.appId)}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 mt-2"
                  >
                    {expandedDescriptions[selectedApp.appId] ? (
                      <>
                        <span>Show less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Show more</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && apps.length === 0 && searchQuery && (
          <div className="text-center py-8 max-w-7xl mx-auto">
            <p className="text-gray-500">No apps found. Try another search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayStoreScraper;