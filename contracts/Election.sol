pragma solidity >=0.4.2;

contract Election {
    //model a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    //read/write candidates
    mapping(uint => Candidate) public candidates;

    //store accounts that have voted
    //key point: if this gets called w/ an address that hasn't voted, defaults to false
    mapping(address => bool) public voters;

    //the "indexed" keyword in the event below helps you search the logs for the event
    event votedEvent(
        uint indexed _candidateId
    );

    //store Candidates count 
    uint public candidatesCount;

    constructor() public {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote count
        candidates[_candidateId].voteCount++;

        //fire event 
        emit votedEvent(_candidateId);
    }
}