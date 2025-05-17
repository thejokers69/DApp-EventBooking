import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
// import EventItem from './EventItem';

function EventList({ contract, account, reserveEvent, loading }) {
  const [eventsData, setEventsData] = useState([]);

  const fetchEvents = useCallback(async () => {
    if (!contract) return;
    try {
      const count = await contract.eventCount();
      if (count.toNumber() === 0) {
        setEventsData([]); // No events available
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
      setEventsData(eventsData);
    } catch (error) {
      toast.error("Error fetching events: " + error.message);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="events-container">
      <h2>Événements disponibles</h2>
      
      {eventsData.length === 0 ? (
        <p>Aucun événement disponible.</p>
      ) : (
        <div className="event-list">
          {eventsData.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <div className="event-details">
                <p>Capacité totale: {event.capacity}</p>
                <p>Places réservées: {event.registered}</p>
                <p>Places restantes: {event.capacity - event.registered}</p>
              </div>
              
              <div className="event-action">
                {event.hasReserved ? (
                  <span className="reserved-badge">Déjà réservé</span>
                ) : event.registered >= event.capacity ? (
                  <span className="full-badge">Complet</span>
                ) : (
                  <button 
                    onClick={() => reserveEvent(event.id)} 
                    disabled={loading}
                    className="reserve-button"
                  >
                    {loading ? 'Traitement...' : 'Réserver une place'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;
