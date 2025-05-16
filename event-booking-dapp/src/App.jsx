import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventList from './components/EventList';
import EventAbi from './EventBooking.json';
import './App.css';

// Define the contract address
const contractAddress = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"; // Adjust the network ID if necessary

function App() {
  // const [provider, setProvider] = useState(null);
  // const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      setLoading(true); // Set loading to true when starting to connect
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contract = new ethers.Contract(contractAddress, EventAbi.abi, signer);
        setContract(contract);

        // Check if the connected account is the owner
        const ownerAddress = await contract.owner(); // Assuming your contract has an owner() function
        setIsOwner(ownerAddress.toLowerCase() === address.toLowerCase());

        await fetchEvents(contract); // Fetch events after connecting
      } else {
        setError("MetaMask is not installed.");
      }
    } catch (err) {
      setError("Connection error: " + err.message);
    } finally {
      setLoading(false); // Set loading to false after the operation
    }
  };

  // Fetch events
  const fetchEvents = async (contract) => {
    try {
      setLoading(true); // Set loading to true when fetching events
      const count = await contract.eventCount();
      if (count.toNumber() === 0) {
        setEvents([]); // No events available
        return;
      }
      const eventsList = [];
      for (let i = 0; i < count; i++) {
        const event = await contract.events(i);
        eventsList.push({
          id: i,
          name: event.name,
          capacity: event.capacity.toString(),
          registered: event.registered.toString(),
        });
      }
      setEvents(eventsList);
    } catch (err) {
      setError("Error fetching events: " + err.message);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  // Reserve a spot for an event
  const reserveSpot = async (eventId) => {
    try {
      if (!contract) {
        setError("Contract not initialized.");
        return;
      }
      const tx = await contract.reserve(eventId);
      await tx.wait(); // Wait for the transaction to be mined
      await fetchEvents(contract); // Refresh events after reservation
      toast.success("Reservation successful!");
    } catch (err) {
      setError("Reservation error: " + err.message);
      toast.error("Reservation error: " + err.message);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchEvents(contract); // Fetch events on contract load
    }
  }, [contract]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Event Booking DApp</h1>
      <div className="max-w-3xl mx-auto">
        {loading ? ( // Show loading indicator
          <p>Loading...</p>
        ) : !account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
          >
            Connect MetaMask
          </button>
        ) : (
          <div>
            <p className="text-green-600 mb-4">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
            {isOwner && <p className="text-blue-600">You are the owner of this contract.</p>}
            {error && <p className="error">{error}</p>}
            <h2>Available Events</h2>
            <EventList contract={contract} account={account} events={events} reserveSpot={reserveSpot} />
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
