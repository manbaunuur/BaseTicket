// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTickets is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Event {
        string name;
        uint date;
        uint price;
        uint ticketCount;
    }

    mapping(uint => Event) public events;
    uint public eventCount;

    constructor() ERC721("EventTicket", "ETKT") {}

    function createEvent(string memory _name, uint _date, uint _price, uint _ticketCount) public onlyOwner {
        events[eventCount] = Event(_name, _date, _price, _ticketCount);
        eventCount++;
    }

    function buyTicket(uint _eventId) public payable {
        require(_eventId < eventCount, "Event does not exist");
        Event storage evt = events[_eventId];
        require(msg.value == evt.price, "Incorrect value sent");
        require(evt.ticketCount > 0, "Tickets sold out");

        evt.ticketCount--;
        _safeMint(msg.sender, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function getEvent(uint _eventId) public view returns (string memory, uint, uint, uint) {
        require(_eventId < eventCount, "Event does not exist");
        Event storage evt = events[_eventId];
        return (evt.name, evt.date, evt.price, evt.ticketCount);
    }
}
