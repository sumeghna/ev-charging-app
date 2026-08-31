import React, { useState } from 'react';

const StationCard = ({ station, onGetDirections, onBookNow, isDark }) => {
  const { name, address, connectors, pricing, rating, amenities } = station;
  const [isHovered, setIsHovered] = useState(false);
  
  const priceInINR = (pricing || 0) * 80;

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div 
      className={`${cardBg} rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border ${borderColor} ${
        isHovered ? 'shadow-2xl transform -translate-y-2' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with Gradient */}
      <div className={`p-5 ${isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} border-b ${borderColor}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-bold ${textColor} truncate`}>{name}</h3>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                Live
              </span>
            </div>
            <p className={`text-sm ${textMuted} truncate`}>
              {address?.street}, {address?.city}
            </p>
            <p className={`text-xs ${textMuted}`}>{address?.state}</p>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full ml-2 ${isDark ? 'bg-gray-600' : 'bg-yellow-100'} flex-shrink-0`}>
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className={`text-sm font-bold ${textColor}`}>{rating || 'New'}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {connectors?.slice(0, 4).map((conn, idx) => (
            <span
              key={idx}
              className={`px-2.5 py-1 text-xs rounded-full font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-700'} border ${borderColor}`}
            >
              {conn.type} · {conn.count}b
            </span>
          ))}
          {connectors?.length > 4 && (
            <span className={`text-xs ${textMuted} flex items-center`}>+{connectors.length - 4}</span>
          )}
        </div>

        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className={`text-xs ${textMuted} px-2 py-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-full`}>
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="pt-4 border-t ${borderColor} flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div>
              <span className={`text-2xl font-bold ${textColor}`}>
                ₹{priceInINR.toFixed(2)}
              </span>
              <span className={`text-sm ${textMuted} ml-1`}>/kWh</span>
            </div>
            <button
              onClick={() => onBookNow(station)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
            >
              Book Now
            </button>
          </div>
          
          <button
            onClick={() => onGetDirections(station)}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            🗺️ Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationCard;