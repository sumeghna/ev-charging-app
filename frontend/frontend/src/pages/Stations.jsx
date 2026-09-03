import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import StationCard from '../components/StationCard';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

// ==================== FIX LEAFLET DEFAULT ICONS ====================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ==================== CSS ANIMATIONS ====================
const markerStyles = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  .custom-marker-container {
    background: transparent !important;
  }
  .gradient-text {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .leaflet-container {
    z-index: 1 !important;
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = markerStyles;
  document.head.appendChild(styleElement);
}

// ==================== CUSTOM MARKER ICON ====================
const createCustomIcon = (rating, isDark) => {
  let color, glowColor, label;
  
  if (rating >= 4.5) {
    color = '#22c55e';
    glowColor = 'rgba(34, 197, 94, 0.4)';
    label = 'Excellent';
  } else if (rating >= 4.0) {
    color = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.4)';
    label = 'Good';
  } else if (rating >= 3.0) {
    color = '#f97316';
    glowColor = 'rgba(249, 115, 22, 0.4)';
    label = 'Average';
  } else {
    color = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.4)';
    label = 'Poor';
  }

  const borderColor = isDark ? '#1f2937' : '#ffffff';

  return L.divIcon({
    className: 'custom-marker-container',
    html: `
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 56px; height: 56px; border-radius: 50%; background: ${glowColor}; animation: pulse 2s infinite; box-shadow: 0 0 30px ${glowColor};"></div>
        <div style="background: ${color}; width: 38px; height: 38px; border-radius: 50%; border: 3px solid ${borderColor}; box-shadow: 0 4px 16px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; z-index: 1; position: relative;">
          ⚡
        </div>
        <div style="position: absolute; bottom: -2px; right: -2px; background: ${borderColor}; border-radius: 50%; padding: 2px; z-index: 2;">
          <div style="background: ${color}; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold;">
            ${rating ? rating.toFixed(1) : 'N'}
          </div>
        </div>
        <div style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.75); color: white; padding: 2px 10px; border-radius: 4px; font-size: 8px; white-space: nowrap; z-index: 3; letter-spacing: 0.5px; font-weight: 500;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

// ==================== MAP CONTROLLER ====================
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);
  return null;
};

// ==================== INDIAN CITIES ====================
const INDIAN_CITIES = {
  'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 12 },
  'Delhi': { lat: 28.7041, lng: 77.1025, zoom: 12 },
  'Bangalore': { lat: 12.9716, lng: 77.5946, zoom: 12 },
  'Chennai': { lat: 13.0827, lng: 80.2707, zoom: 12 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 12 },
  'Pune': { lat: 18.5204, lng: 73.8567, zoom: 12 },
  'Kolkata': { lat: 22.5726, lng: 88.3639, zoom: 12 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 12 },
  'Jaipur': { lat: 26.9124, lng: 75.7873, zoom: 12 },
  'Lucknow': { lat: 26.8467, lng: 80.9462, zoom: 12 },
};

// ==================== MAIN COMPONENT ====================
const Stations = () => {
  const { isDark } = useContext(ThemeContext);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [zoom, setZoom] = useState(5);
  const [showMap, setShowMap] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    connectors: [{ type: 'CCS2', count: 2, power: 150 }],
    pricing: 0.30,
    amenities: [],
    operatingHours: { open: '06:00', close: '23:00' }
  });

  const fetchStationsByCity = async (city) => {
    setIsSearching(true);
    setLoading(true);
    setShowMap(true);
    setHasSearched(true);
    try {
      const { data } = await api.get(`/stations/city/${city}`);
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
      toast.error('Failed to fetch stations');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    const cityData = INDIAN_CITIES[city];
    if (cityData) {
      setMapCenter([cityData.lat, cityData.lng]);
      setZoom(cityData.zoom);
      fetchStationsByCity(city);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setZoom(13);
          setSelectedCity('');
          setShowMap(true);
          setHasSearched(true);
          setLoading(true);
          try {
            const params = new URLSearchParams();
            params.append('lat', latitude);
            params.append('lng', longitude);
            params.append('radiusKm', 50);
            const { data } = await api.get(`/stations?${params.toString()}`);
            setStations(data);
          } catch (error) {
            toast.error('Failed to fetch nearby stations');
          } finally {
            setLoading(false);
            setIsSearching(false);
          }
        },
        (error) => {
          setIsSearching(false);
          toast.error('Unable to get your location. Please select a city.');
        }
      );
    }
  };

  const openGoogleMaps = (station) => {
    const { coordinates } = station.location;
    const lat = coordinates[1];
    const lng = coordinates[0];
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleBookNow = (station) => {
    if (!user) {
      toast.error('Please login to book a charging slot');
      navigate('/login');
      return;
    }
    navigate(`/stations/${station._id}`);
  };

  const handleAddStation = async () => {
    try {
      const stationData = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: [INDIAN_CITIES[selectedCity]?.lng || 77.2165, INDIAN_CITIES[selectedCity]?.lat || 28.6304]
        }
      };
      
      await api.post('/stations', stationData);
      toast.success('Station added successfully!');
      setShowAddModal(false);
      if (selectedCity) {
        fetchStationsByCity(selectedCity);
      }
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add station');
    }
  };

  const handleEditStation = (station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      address: station.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
      connectors: station.connectors || [{ type: 'CCS2', count: 2, power: 150 }],
      pricing: station.pricing || 0.30,
      amenities: station.amenities || [],
      operatingHours: station.operatingHours || { open: '06:00', close: '23:00' }
    });
    setShowEditModal(true);
  };

  const handleUpdateStation = async () => {
    try {
      await api.put(`/stations/${editingStation._id}`, formData);
      toast.success('Station updated successfully!');
      setShowEditModal(false);
      setEditingStation(null);
      if (selectedCity) {
        fetchStationsByCity(selectedCity);
      }
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update station');
    }
  };

  const handleDeleteStation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this station?')) return;
    try {
      await api.delete(`/stations/${id}`);
      toast.success('Station deleted successfully');
      if (selectedCity) {
        fetchStationsByCity(selectedCity);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete station');
    }
  };

  const handleDeactivateStation = async (id) => {
    try {
      await api.patch(`/stations/${id}/deactivate`);
      toast.success('Station deactivated');
      if (selectedCity) {
        fetchStationsByCity(selectedCity);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deactivate station');
    }
  };

  const handleReactivateStation = async (id) => {
    try {
      await api.patch(`/stations/${id}/reactivate`);
      toast.success('Station reactivated');
      if (selectedCity) {
        fetchStationsByCity(selectedCity);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reactivate station');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: { street: '', city: selectedCity || '', state: '', pincode: '', country: 'India' },
      connectors: [{ type: 'CCS2', count: 2, power: 150 }],
      pricing: 0.30,
      amenities: [],
      operatingHours: { open: '06:00', close: '23:00' }
    });
  };

  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const canManage = user?.role === 'station_owner' || user?.role === 'admin';

  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* ========== REDESIGNED HERO SECTION ========== */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}></div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge - FIXED for light mode */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6 border border-green-200 dark:border-green-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live across India
            </div>

            {/* Main Heading */}
            <h1 className={`text-4xl md:text-6xl font-bold ${textColor} mb-4 tracking-tight leading-tight`}>
              Power Your Journey
              <span className="block gradient-text">Find EV Charging</span>
            </h1>

            {/* Description */}
            <p className={`text-lg ${textMuted} max-w-2xl mx-auto mb-10 leading-relaxed`}>
              Discover nearby EV charging stations, check real-time availability, 
              and book your spot in seconds — all from one place.
            </p>

            {/* Search Box */}
            <div className={`${cardBg} rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto border ${borderColor} backdrop-blur-sm`}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📍</span>
                  <select
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer`}
                    value={selectedCity}
                    onChange={(e) => handleCitySelect(e.target.value)}
                  >
                    <option value="">Select your city</option>
                    {Object.keys(INDIAN_CITIES).map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleUseLocation}
                  disabled={isSearching}
                  className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 font-medium whitespace-nowrap flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                  {isSearching ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>📍</span> Use My Location
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 md:gap-12">
              <div className="text-center group cursor-default">
                <div className={`text-3xl font-bold ${textColor} group-hover:text-blue-500 transition-colors duration-300`}>20+</div>
                <div className={`text-sm ${textMuted}`}>Cities</div>
              </div>
              <div className="text-center group cursor-default">
                <div className={`text-3xl font-bold ${textColor} group-hover:text-green-500 transition-colors duration-300`}>50+</div>
                <div className={`text-sm ${textMuted}`}>Stations</div>
              </div>
              <div className="text-center group cursor-default">
                <div className={`text-3xl font-bold ${textColor} group-hover:text-purple-500 transition-colors duration-300`}>24/7</div>
                <div className={`text-sm ${textMuted}`}>Availability</div>
              </div>
              <div className="text-center group cursor-default">
                <div className={`text-3xl font-bold ${textColor} group-hover:text-yellow-500 transition-colors duration-300`}>4.5★</div>
                <div className={`text-sm ${textMuted}`}>Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== FEATURES SECTION ========== */}
      {!hasSearched && (
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textColor} mb-2`}>How It Works</h2>
            <p className={`${textMuted}`}>Find, book, and charge in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className={`${cardBg} rounded-2xl p-8 text-center border ${borderColor} hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2`}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className={`text-xl font-semibold ${textColor} mb-2`}>Find Stations</h3>
              <p className={`text-sm ${textMuted} leading-relaxed`}>
                Search for EV charging stations in your city or discover nearby options instantly
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 text-center border ${borderColor} hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2`}>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className={`text-xl font-semibold ${textColor} mb-2`}>Book a Slot</h3>
              <p className={`text-sm ${textMuted} leading-relaxed`}>
                Check real-time availability and reserve your charging time with ease
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 text-center border ${borderColor} hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-2`}>
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🚗</span>
              </div>
              <h3 className={`text-xl font-semibold ${textColor} mb-2`}>Charge & Go</h3>
              <p className={`text-sm ${textMuted} leading-relaxed`}>
                Get directions to the station and start charging your vehicle instantly
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== MAP SECTION ========== */}
      {showMap && (
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className={`${cardBg} rounded-2xl shadow-2xl p-3 border ${borderColor}`}>
            <div className="h-[450px] rounded-xl overflow-hidden relative">
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                attributionControl={true}
                className="relative z-0"
              >
                <MapController center={mapCenter} zoom={zoom} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
                {stations.map((station) => (
                  <Marker
                    key={station._id}
                    position={[station.location.coordinates[1], station.location.coordinates[0]]}
                    icon={createCustomIcon(station.rating || 0, isDark)}
                  >
                    <Popup>
                      <div className="p-3 min-w-[240px]">
                        <h3 className="font-bold text-gray-800 text-lg">{station.name}</h3>
                        <p className="text-sm text-gray-600">{station.address?.street}</p>
                        <p className="text-sm text-gray-500">{station.address?.city}, {station.address?.state}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold">{station.rating || 'New'}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-sm font-medium text-green-600">
                            ₹{((station.pricing || 0) * 80).toFixed(2)}/kWh
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {station.connectors?.slice(0, 3).map((c, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {c.type} ({c.count})
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => openGoogleMaps(station)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                          >
                            🗺️ Directions
                          </button>
                          <button
                            onClick={() => handleBookNow(station)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                          >
                            📅 Book
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========== RESULTS SECTION ========== */}
      {hasSearched && (
        <div className="container mx-auto px-4 py-8 pb-20 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`${textMuted} mt-4 font-medium`}>Finding charging stations...</p>
            </div>
          ) : stations.length === 0 ? (
            <div className={`${cardBg} rounded-2xl shadow-2xl p-16 text-center border ${borderColor}`}>
              <div className="text-6xl mb-4">🔌</div>
              <h3 className={`text-2xl font-bold ${textColor} mb-2`}>No Stations Found</h3>
              <p className={`${textMuted} max-w-md mx-auto`}>
                We couldn't find any charging stations in this area. Try selecting a different city.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
                <div>
                  <h2 className={`text-2xl font-bold ${textColor}`}>
                    ⚡ {stations.length} Station{stations.length > 1 ? 's' : ''} Available
                  </h2>
                  <p className={`text-sm ${textMuted}`}>
                    {selectedCity ? `in ${selectedCity}` : 'near your location'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className={`text-sm ${textMuted}`}>Live</span>
                  {canManage && (
                    <>
                      <span className={`px-3 py-1 ${isDark ? 'bg-green-900' : 'bg-green-100'} ${isDark ? 'text-green-300' : 'text-green-700'} rounded-full text-sm font-medium`}>
                        👑 Manage
                      </span>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 text-sm font-medium flex items-center gap-1 shadow-md hover:shadow-lg"
                      >
                        ➕ Add Station
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stations.map((station) => (
                  <StationCard 
                    key={station._id} 
                    station={station} 
                    onGetDirections={openGoogleMaps}
                    onBookNow={handleBookNow}
                    isDark={isDark}
                    canManage={canManage}
                    onDelete={handleDeleteStation}
                    onDeactivate={handleDeactivateStation}
                    onReactivate={handleReactivateStation}
                    onEdit={handleEditStation}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========== MODALS ========== */}
      {showAddModal && (
        <StationModal
          isDark={isDark}
          formData={formData}
          setFormData={setFormData}
          onSave={handleAddStation}
          onClose={() => setShowAddModal(false)}
          selectedCity={selectedCity}
          title="Add New Station"
          buttonText="Add Station"
        />
      )}

      {showEditModal && (
        <StationModal
          isDark={isDark}
          formData={formData}
          setFormData={setFormData}
          onSave={handleUpdateStation}
          onClose={() => {
            setShowEditModal(false);
            setEditingStation(null);
            resetForm();
          }}
          selectedCity={selectedCity}
          title="Edit Station"
          buttonText="Update Station"
        />
      )}
    </div>
  );
};

// ==================== STATION MODAL ====================
const StationModal = ({ isDark, formData, setFormData, onSave, onClose, selectedCity, title, buttonText }) => {
  const modalBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-gray-700' : 'bg-gray-50';
  const inputText = isDark ? 'text-white' : 'text-gray-900';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleConnectorChange = (index, field, value) => {
    const updated = [...formData.connectors];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, connectors: updated });
  };

  const addConnector = () => {
    setFormData({
      ...formData,
      connectors: [...formData.connectors, { type: 'CCS2', count: 2, power: 150 }]
    });
  };

  const removeConnector = (index) => {
    if (formData.connectors.length <= 1) {
      toast.error('Station must have at least one connector');
      return;
    }
    const updated = formData.connectors.filter((_, i) => i !== index);
    setFormData({ ...formData, connectors: updated });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${modalBg} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border ${borderColor}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${textColor}`}>{title}</h2>
          <button onClick={onClose} className={`${textMuted} hover:${textColor} text-2xl`}>✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Station Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., Bandra West EV Hub"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Street</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Street address"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>City *</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city || selectedCity}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Mumbai"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Maharashtra"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., 400050"
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Price per kWh (USD)</label>
            <input
              type="number"
              name="pricing"
              value={formData.pricing}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., 0.30"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textColor} mb-2`}>Connectors</label>
            {formData.connectors.map((conn, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  value={conn.type}
                  onChange={(e) => handleConnectorChange(index, 'type', e.target.value)}
                  className={`flex-1 px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="Type1">Type 1</option>
                  <option value="Type2">Type 2</option>
                  <option value="CCS1">CCS1</option>
                  <option value="CCS2">CCS2</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="Tesla">Tesla</option>
                  <option value="GB/T">GB/T</option>
                </select>
                <input
                  type="number"
                  value={conn.count}
                  onChange={(e) => handleConnectorChange(index, 'count', parseInt(e.target.value))}
                  className={`w-20 px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Count"
                  min="1"
                />
                <input
                  type="number"
                  value={conn.power}
                  onChange={(e) => handleConnectorChange(index, 'power', parseInt(e.target.value))}
                  className={`w-20 px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="kW"
                  min="1"
                />
                <button
                  onClick={() => removeConnector(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addConnector}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Add Connector
            </button>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textColor} mb-1`}>Amenities (comma separated)</label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="e.g., cafe, wifi, restroom"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Open Time</label>
              <input
                type="time"
                name="operatingHours.open"
                value={formData.operatingHours.open}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${textColor} mb-1`}>Close Time</label>
              <input
                type="time"
                name="operatingHours.close"
                value={formData.operatingHours.close}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg ${inputBg} ${inputText} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t ${borderColor}">
            <button
              onClick={onSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors duration-300 font-medium"
            >
              {buttonText}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textColor} px-6 py-3 rounded-xl transition-colors duration-300 font-medium`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stations;