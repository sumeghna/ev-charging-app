import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const StationCard = ({
  station,
  onGetDirections,
  onBookNow,
  isDark,
  canManage,
  onDelete,
  onDeactivate,
  onReactivate,
  onEdit  // Add this new prop
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { _id, name, address, connectors, pricing, rating, amenities, isActive } = station;
  
  const priceInINR = (pricing || 0) * 80;

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  // Handle Edit - Navigate to edit page or open modal
  const handleEdit = () => {
    // Navigate to station detail page with edit mode
    navigate(`/stations/${_id}?edit=true`);
  };

  return (
    <div 
      className={`${cardBg} rounded-xl shadow-md overflow-hidden transition-all duration-300 border ${borderColor} ${
        isHovered ? 'shadow-lg transform -translate-y-1' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${textColor} truncate`}>{name}</h3>
            <p className={`text-sm ${textMuted} truncate`}>
              {address?.street}, {address?.city}
            </p>
            <p className={`text-xs ${textMuted}`}>{address?.state}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ml-2 ${isDark ? 'bg-gray-700' : 'bg-yellow-50'} flex-shrink-0`}>
            <span className="text-yellow-500 text-sm">⭐</span>
            <span className={`text-sm font-medium ${textColor}`}>{rating || 'New'}</span>
          </div>
        </div>

        {/* Connectors */}
        <div className="mt-3 flex flex-wrap gap-2">
          {connectors?.slice(0, 3).map((conn, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-blue-700'} border ${borderColor}`}
            >
              {conn.type} · {conn.count}b
            </span>
          ))}
          {connectors?.length > 3 && (
            <span className={`text-xs ${textMuted}`}>+{connectors.length - 3} more</span>
          )}
        </div>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className={`text-xs ${textMuted}`}>
                #{amenity}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex justify-between items-center">
          <div>
            <span className={`text-xl font-bold ${textColor}`}>
              ₹{priceInINR.toFixed(2)}
            </span>
            <span className={`text-sm ${textMuted} ml-1`}>/kWh</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isActive ? '● Active' : '● Inactive'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t ${borderColor} flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onBookNow(station)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
            >
              📅 Book Now
            </button>
            <button
              onClick={() => onGetDirections(station)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-1"
            >
              🗺️ Directions
            </button>
          </div>

          {/* Management Buttons - Only for station owners and admins */}
          {canManage && (
            <div className="flex flex-wrap gap-2 pt-2 border-t ${borderColor}">
              {/* EDIT BUTTON - Now visible */}
              <button
                onClick={handleEdit}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs font-medium"
              >
                ✏️ Edit
              </button>
              <Link
                to={`/stations/${_id}`}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs font-medium text-center"
              >
                👁️ View
              </Link>
              {isActive ? (
                <button
                  onClick={() => onDeactivate(_id)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs font-medium"
                >
                  🔒 Deactivate
                </button>
              ) : (
                <button
                  onClick={() => onReactivate(_id)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs font-medium"
                >
                  🔓 Reactivate
                </button>
              )}
              <button
                onClick={() => onDelete(_id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-xs font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationCard;