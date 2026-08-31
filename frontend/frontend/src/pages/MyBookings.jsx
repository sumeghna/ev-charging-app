import React, { useState, useEffect } from 'react';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../api/axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/me');
      setBookings(data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancelling(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading your bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-600">No Bookings Yet</h2>
        <p className="text-gray-500 mt-2">Start charging by booking a station!</p>
        <button
          onClick={() => window.location.href = '/stations'}
          className="btn-primary mt-4"
        >
          Find Stations
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="card">
            <div className="flex flex-wrap justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {booking.station?.name || 'Unknown Station'}
                </h3>
                <p className="text-sm text-gray-600">
                  {booking.station?.address?.street}, {booking.station?.address?.city}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-600">
                    🔌 {booking.connectorType}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <div>
                    📅 {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                  </div>
                  <div>
                    ⏰ {format(new Date(booking.startTime), 'hh:mm a')} -{' '}
                    {format(new Date(booking.endTime), 'hh:mm a')}
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <>
                    {isPast(new Date(booking.endTime)) ? (
                      <span className="text-sm text-gray-500">Expired</span>
                    ) : (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="btn-danger text-sm"
                        disabled={cancelling === booking._id}
                      >
                        {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </>
                )}
                {booking.status === 'completed' && (
                  <span className="text-sm text-green-600">✓ Completed</span>
                )}
                {booking.status === 'cancelled' && (
                  <span className="text-sm text-red-600">✗ Cancelled</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;