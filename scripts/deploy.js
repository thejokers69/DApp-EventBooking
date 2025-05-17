const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Déploiement avec le compte :", deployer.address);

  const EventBooking = await hre.ethers.getContractFactory("EventBooking");
  const eventBooking = await EventBooking.deploy();
  await eventBooking.waitForDeployment();

  console.log("EventBooking déployé à :", await eventBooking.getAddress());

  let tx;

  tx = await eventBooking.createEvent("Concert Web3", 5);
  await tx.wait();  // attendre confirmation

  tx = await eventBooking.createEvent("Conférence Blockchain", 50);
  await tx.wait();

  tx = await eventBooking.createEvent("Atelier React", 30);
  await tx.wait();

  tx = await eventBooking.createEvent("Hackathon Web3", 100);
  await tx.wait();

  console.log("Événements ajoutés !");
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
