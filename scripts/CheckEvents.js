const hre = require("hardhat");

async function main() {
  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // adresse déployée
  const EventBooking = await hre.ethers.getContractFactory("EventBooking");
  const eventBooking = EventBooking.attach(contractAddress);

  const count = await eventBooking.eventCount();
  console.log("Nombre d'événements:", count.toString());

  for (let i = 0; i < count; i++) {
    const e = await eventBooking.events(i);
    console.log(`Événement ${i} : ${e.name} - Capacité : ${e.capacity.toString()} - Inscrits : ${e.registered.toString()}`);
  }
}

main().catch(console.error);
