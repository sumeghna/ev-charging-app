import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addHours } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import PlugIcon from '../components/PlugIcon';

const StationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = React.useContext(ThemeContext);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availability, setAvailability] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const bgColor = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    fetchStation();
  }, [id]);

  useEffect(() => {
    if (selectedConnector && selectedDate && station) {
      fetchAvailability();
    }
  }, [selectedConnector, selectedDate, station]);

  const fetchStation = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/stations/${id}`);
      setStation(data);
      if (data.connectors?.length > 0) {
        setSelectedConnector(data.connectors[0].type);
      }
    } catch (error) {
      toast.error('Failed to load station details');
      navigate('/stations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const { data } = await api.get('/bookings/availability', {
        params: {
          station: id,
          connectorType: selectedConnector,
          date: selectedDate,
        },
      });
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleBooking = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to book a charging slot');
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    try {
      const startTime = new Date(`${selectedDate}T${String(selectedSlot).padStart(2, '0')}:00:00`);
      const endTime = addHours(startTime, 1);

      await api.post('/bookings', {
        station: id,
        connectorType: selectedConnector,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

      toast.success('Booking confirmed!');
      fetchAvailability();
      setSelectedSlot(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className={`${bgColor} min-h-screen flex items-center justify-center`}>
      <div className={`text-center ${textMuted}`}>Loading station details...</div>
    </div>;
  }

  if (!station) {
    return <div className={`${bgColor} min-h-screen flex items-center justify-center`}>
      <div className={`text-center ${textMuted}`}>Station not found</div>
    </div>;
  }

  const priceInINR = (station.pricing || 0) * 80;

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300 py-8`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-6 border ${borderColor}`}>
          <h1 className={`text-2xl font-bold ${textColor}`}>{station.name}</h1>
          <p className={`${textMuted} mt-1`}>
            {station.address?.street}, {station.address?.city}, {station.address?.state}
          </p>
          <div className="flex items-center mt-2 gap-4">
            <div className="flex items-center">
              <span className="text-yellow-500">⭐</span>
              <span className={`ml-1 ${textColor}`}>{station.rating || 'New'}</span>
            </div>
            <span className={textMuted}>•</span>
            <span className={`font-medium ${textColor}`}>₹{priceInINR.toFixed(2)}/kWh</span>
          </div>
          {station.amenities?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {station.amenities.map((amenity, idx) => (
                <span key={idx} className={`px-2 py-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textMuted} text-sm rounded`}>
                  {amenity}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4">
            <h3 className={`font-semibold ${textColor} mb-2`}>Connectors Available:</h3>
            <div className="flex flex-wrap gap-3">
              {station.connectors?.map((conn) => (
                <div
                  key={conn.type}
                  className={`px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    selectedConnector === conn.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : `${borderColor} hover:border-blue-300`
                  }`}
                  onClick={() => setSelectedConnector(conn.type)}
                >
                  <div className="flex items-center space-x-2">
                    <PlugIcon type={conn.type} size={20} />
                    <span className={`font-medium ${textColor}`}>{conn.type}</span>
                  </div>
                  <div className={`text-sm ${textMuted}`}>
                    {conn.count} bays • {conn.power}kW
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedConnector && (
          <div className={`${cardBg} rounded-xl shadow-lg p-6 border ${borderColor}`}>
            <h2 className={`text-xl font-bold ${textColor} mb-4`}>Book a Slot</h2>
            <div className="mb-4">
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Select Date</label>
              <input
                type="date"
                className={`w-full px-4 py-3 rounded-lg ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium ${textColor} mb-2`}>Available Time Slots</label>
              {availability.length === 0 ? (
                <div className={`${textMuted}`}>Loading availability...</div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {availability.map((slot) => (
                    <button
                      key={slot.hour}
                      className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                        slot.isFull
                          ? `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed ${borderColor}`
                          : selectedSlot === slot.hour
                          ? 'bg-blue-600 text-white border-blue-600'
                          : `${cardBg} ${textColor} ${borderColor} hover:border-blue-400 hover:shadow-sm`
                      }`}
                      onClick={() => !slot.isFull && setSelectedSlot(slot.hour)}
                      disabled={slot.isFull}
                    >
                      <div className="font-medium">{String(slot.hour).padStart(2, '0')}:00</div>
                      <div className="text-xs opacity-75">
                        {slot.isFull ? '🔴 Full' : `${slot.available}/${slot.total}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleBooking}
              disabled={!selectedSlot || bookingLoading}
            >
              {bookingLoading
                ? 'Booking...'
                : selectedSlot
                ? `Book for ${String(selectedSlot).padStart(2, '0')}:00`
                : 'Select a time slot'}
            </button>
            {!user && (
              <p className={`text-sm ${textMuted} text-center mt-3`}>
                👤 Please login to book a charging slot
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationDetail;