import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import contractABI from "./contractABI.json";
import "./styles/global.css";
import ConnectWallet from './components/ConnectWallet';
import EventList from './components/EventList';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Installe MetaMask !");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      // We need to access the "abi" property of the contractABI object
      const eventContract = new ethers.Contract(contractAddress, contractABI.abi, signer);
      setContract(eventContract);
      setErrorMsg(null);
    } catch (error) {
      console.error("Erreur de connexion :", error);
      alert("Erreur lors de la connexion à MetaMask");
    }
  };

  const loadEvents = useCallback(async () => {
    if (!contract || !account) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const count = await contract.eventCount();
      const tempEvents = [];
      // In ethers.js v6, numeric values are returned as JavaScript BigInt
      for (let i = 0; i < Number(count); i++) {
        const e = await contract.events(i);
        const reserved = await contract.reservations(account, i);
        tempEvents.push({
          id: i,
          name: e.name,
          capacity: Number(e.capacity),
          registered: Number(e.registered),
          availableSeats: Number(e.capacity) - Number(e.registered),
          reserved: reserved,
        });
      }
      setEvents(tempEvents);
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
      setErrorMsg("Erreur lors du chargement des événements");
    }
    setLoading(false);
  }, [contract, account]);

  const reserveEvent = async (eventId) => {
    if (!contract) {
      alert("Connecte-toi d'abord à MetaMask !");
      return;
    }
    setErrorMsg(null);
    try {
      setLoading(true);
      const tx = await contract.reserve(eventId);
      await tx.wait(); // Wait for transaction confirmation
      alert("Réservation réussie !");
      loadEvents(); // Reload events to update UI
    } catch (error) {
      console.error("Erreur réservation :", error);
      const message = error?.data?.message || error.message || "Erreur inconnue";
      setErrorMsg("Erreur lors de la réservation : " + message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && account) {
      loadEvents();
    }
  }, [contract, account, loadEvents]);

  return (
    <div className="app-container">
      <header>
        <h1>Réservation d'événements</h1>
        {!account ? (
          <button className="btn btn-primary" onClick={connectWallet}>
            Connecter MetaMask
          </button>
        ) : (
          <p className="account-info">
            Connecté : <span>{account}</span>
          </p>
        )}
      </header>

      <main>
        {loading ? (
          <p className="loading">Chargement des événements...</p>
        ) : errorMsg ? (
          <p className="error-message">{errorMsg}</p>
        ) : events.length === 0 ? (
          <p className="no-events">Aucun événement disponible.</p>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Capacité</th>
                <th>Places restantes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isFull = event.availableSeats === 0;
                const alreadyReserved = event.reserved;
                return (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td>{event.capacity}</td>
                    <td>{event.availableSeats}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        disabled={isFull || alreadyReserved}
                        title={
                          isFull
                            ? "Événement complet"
                            : alreadyReserved
                            ? "Vous avez déjà réservé"
                            : "Réserver"
                        }
                        onClick={() => reserveEvent(event.id)}
                      >
                        {isFull ? "Complet" : alreadyReserved ? "Réservé" : "Réserver"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>


    </div>
  );
}

export default App;
