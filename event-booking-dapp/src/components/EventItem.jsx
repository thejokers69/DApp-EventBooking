import { toast } from 'react-toastify';

function EventItem({ event, contract, loading, setLoading, refreshEvents }) {
  const handleReserve = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.reserve(event.id);
      await tx.wait();
      toast.success("Reservation successful!");
      refreshEvents();
    } catch (error) {
      toast.error("Reservation failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white">
      <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
      <p className="text-gray-600">Capacity: {event.capacity}</p>
      <p className="text-gray-600">Places Remaining: {event.capacity - event.registered}</p>
      <button
        onClick={handleReserve}
        disabled={event.hasReserved || event.registered >= event.capacity || loading}
        className={`mt-2 w-full py-2 px-4 rounded-lg transition ${
          event.hasReserved || event.registered >= event.capacity
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {loading ? 'Reserving...' : 'Reserve'}
      </button>
    </div>
  );
}

export default EventItem;
