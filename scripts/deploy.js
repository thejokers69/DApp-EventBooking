const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy EventBooking contract
  const EventBooking = await ethers.getContractFactory("EventBooking");
  const eventBooking = await EventBooking.deploy();
  
  await eventBooking.waitForDeployment();

  console.log("EventBooking deployed to:", eventBooking.address);

  // Create two events
  const tx1 = await eventBooking.createEvent("Conference", 100);
  await tx1.wait();
  console.log("Created event: Conference");

  const tx2 = await eventBooking.createEvent("Concert", 50);
  await tx2.wait();
  console.log("Created event: Concert");

  // Check the event count
  const count = await eventBooking.eventCount();
  console.log("Total events created:", count.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
