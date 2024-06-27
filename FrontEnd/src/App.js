import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import EventTickets from './abis/EventTickets.json';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlockchainData() {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const networkData = EventTickets.networks[networkId];
      if (networkData) {
        const eventTickets = new web3.eth.Contract(EventTickets.abi, networkData.address);
        setContract(eventTickets);

        const eventCount = await eventTickets.methods.eventCount().call();
        const events = [];
        for (let i = 0; i < eventCount; i++) {
          const event = await eventTickets.methods.events(i).call();
          events.push(event);
        }
        setEvents(events);
        setLoading(false);
      } else {
        window.alert('EventTickets contract not deployed to detected network.');
      }
    }

    loadBlockchainData();
  }, []);

  const buyTicket = async (eventId, price) => {
    await contract.methods.buyTicket(eventId).send({ from: account, value: price });
    const updatedEvents = [...events];
    updatedEvents[eventId].ticketCount -= 1;
    setEvents(updatedEvents);
  };

  return (
    <div>
      <h1>SmartEvent Ticketing</h1>
      <p>Account: {account}</p>
      {loading ? (
        <p>Loading events...</p>
      ) : (
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <h2>{event.name}</h2>
              <p>Date: {new Date(event.date * 1000).toLocaleString()}</p>
              <p>Price: {Web3.utils.fromWei(event.price, 'ether')} ETH</p>
              <p>Tickets Remaining: {event.ticketCount}</p>
              <button onClick={() => buyTicket(index, event.price)}>Buy Ticket</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
