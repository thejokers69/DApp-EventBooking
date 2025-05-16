import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import EventItem from './EventItem';

function EventList({ contract, account, reserveSpot }) {
  const [events, setEvents] = useState([]);

  const fetchEvents = useCallback(async () => {
    if (!contract) return;
    try {
      const count = await contract.eventCount();
      if (count.toNumber() === 0) {
        setEvents([]); // No events available
        return;
      }
      const eventsData = [];
      for (let i = 0; i < count; i++) {
        const event = await contract.events(i);
        const hasReserved = await contract.reservations(account, i);
        eventsData.push({
          id: i,
          name: event.name,
          capacity: event.capacity.toNumber(),
          registered: event.registered.toNumber(),
          hasReserved,
        });
      }
      setEvents(eventsData);
    } catch (error) {
      toast.error("Error fetching events: " + error.message);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Available Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-600">No events available</p>
      ) : (
        events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            reserveSpot={reserveSpot}
          />
        ))
      )}
    </div>
  );
}

export default EventList;
