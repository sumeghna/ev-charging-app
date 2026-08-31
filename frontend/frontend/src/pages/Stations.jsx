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

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (rating, isDark) => {
  const color = rating >= 4.5 ? '#10b981' : rating >= 4.0 ? '#f59e0b' : '#ef4444';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid ${isDark ? '#1f2937' : 'white'}; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">⚡</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, map, zoom]);
  return null;
};

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

  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Hero Section - Premium */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${borderColor}`}>
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live across India
              </div>
              <h1 className={`text-4xl md:text-6xl font-bold ${textColor} mb-4 tracking-tight`}>
                Power Your Journey
                <span className="block text-blue-600">Find EV Charging</span>
              </h1>
              <p className={`text-lg ${textMuted} max-w-2xl mx-auto mb-10 leading-relaxed`}>
                Discover nearby EV charging stations, check real-time availability, 
                and book your spot in seconds — all from one place.
              </p>
              
              {/* Search Box - Premium */}
              <div className={`${cardBg} rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto border ${borderColor}`}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                    <select
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none`}
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
                    className="px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl transition-all duration-300 font-medium whitespace-nowrap flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70"
                  >
                    {isSearching ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      '📍 Use My Location'
                    )}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-10 flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${textColor}`}>50+</div>
                  <div className={`text-sm ${textMuted}`}>Cities</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${textColor}`}>200+</div>
                  <div className={`text-sm ${textMuted}`}>Stations</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${textColor}`}>24/7</div>
                  <div className={`text-sm ${textMuted}`}>Availability</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${textColor}`}>4.5★</div>
                  <div className={`text-sm ${textMuted}`}>Avg. Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Modern Grid */}
      {!hasSearched && (
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textColor} mb-2`}>How It Works</h2>
            <p className={`${textMuted}`}>Find, book, and charge in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className={`${cardBg} rounded-2xl p-8 text-center border ${borderColor} hover:shadow-xl transition-all duration-300 group`}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className={`text-xl font-semibold ${textColor} mb-2`}>Find Stations</h3>
              <p className={`text-sm ${textMuted} leading-relaxed`}>
                Search for EV charging stations in your city or discover nearby options instantly
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 text-center border ${borderColor} hover:shadow-xl transition-all duration-300 group`}>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className={`text-xl font-semibold ${textColor} mb-2`}>Book a Slot</h3>
              <p className={`text-sm ${textMuted} leading-relaxed`}>
                Check real-time availability and reserve your charging time with ease
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 text-center border ${borderColor} hover:shadow-xl transition-all duration-300 group`}>
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

      {/* Map Section - Premium */}
      {showMap && (
        <div className="container mx-auto px-4 py-8">
          <div className={`${cardBg} rounded-2xl shadow-2xl p-3 border ${borderColor}`}>
            <div className="h-[480px] rounded-xl overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
              >
                <MapController center={mapCenter} zoom={zoom} />
                <TileLayer
                  url={isDark 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
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

      {/* Results Section */}
      {hasSearched && (
        <div className="container mx-auto px-4 py-8 pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className={`${textMuted} mt-4 font-medium`}>Finding charging stations...</p>
            </div>
          ) : stations.length === 0 ? (
            <div className={`${cardBg} rounded-2xl shadow-xl p-16 text-center border ${borderColor}`}>
              <div className="text-6xl mb-4">🔌</div>
              <h3 className={`text-2xl font-bold ${textColor} mb-2`}>No Stations Found</h3>
              <p className={`${textMuted} max-w-md mx-auto`}>
                We couldn't find any charging stations in this area. Try selecting a different city.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-2xl font-bold ${textColor}`}>
                    ⚡ {stations.length} Station{stations.length > 1 ? 's' : ''} Available
                  </h2>
                  <p className={`text-sm ${textMuted}`}>
                    {selectedCity ? `in ${selectedCity}` : 'near your location'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className={`text-sm ${textMuted}`}>Live</span>
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
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Stations;