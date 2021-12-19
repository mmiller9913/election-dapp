//note: when testing in truffle console, run this:
    //Election.deployed().then(function(instance) { app = instance })

var Election = artifacts.require('./Election.sol');

contract('Election', (accounts) => {

    before(async() => {
        app = await Election.deployed();
    })

    it("initializes with two candidates", async() => {
        const candidateCount = await app.candidatesCount();
        assert.equal(candidateCount, 2);
    });

    it("it initializes the candidates with the correct values", async() => {
        const candidate1 = await app.candidates(1);
        assert.equal(candidate1.id, 1, "contains the correct id"); //these add on arguments help identify where test failed
        assert.equal(candidate1.name, "Candidate 1", "contains the correct name");
        assert.equal(candidate1.voteCount, 0, "contains the correct vote count");

        const candidate2 = await app.candidates(2);
        assert.equal(candidate2.id, 2, "contains the correct id"); //these add on arguments help identify where test failed
        assert.equal(candidate2.name, "Candidate 2", "contains the correct name");
        assert.equal(candidate2.voteCount, 0, "contains the correct vote count");
    });

    it("allows a voter to cast a vote", async() => {
        const receipt = await app.vote(1, { from: accounts[0] });

        const candidateId = 1;
        const candidate = await app.candidates(candidateId);
        const voted = await app.voters(accounts[0]);
        assert.equal(candidate.voteCount, 1, "candidate vote count increased");
        assert.equal(voted, true, "voter marked as voted");

        //inspect event
        //the event is stored in receipt.logs
        assert.equal(receipt.logs.length, 1, "an event was triggered");
        assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
        assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the candidate id is correct");

    })


    // when expect something to fail
    it("throws exception for invalid candidates", () => {
        return Election.deployed().then(function(app) {
            return app.vote(99, { from: accounts[1]} )
        }).then(assert.fail).catch(function(error) {  //
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            //logic behind 'revert':
                //in the truffle console, when you vote with the same account twice, get an error message that says...
                    //ex: app.vote(1, { from: account] }) 
                    //side note: to get accounts in truffle console ....
                        //get array of all accounts: web3.eth.getAccounts()
                        //make variable "account": web3.eth.getAccounts().then(function(accounts) { account = accounts[0] })
                //Uncaught Error: Returned error: VM Exception while processing transaction: revert
                //
            return app.candidates(1);
        }).then(function(candidate1) {
            var voteCount = candidate1.voteCount;
            assert.equal(voteCount, 1, "candidate 1 did not receive any votes"); //the vote count = 1 because of prior test
            return app.candidates(2);
        }).then(function(candidate2) {
            var voteCount = candidate2.voteCount;
            assert.equal(voteCount, 0, "candidate 2 did not receive any votes"); //the vote count = 1 because of prior test
        })
    })

    it("throws an error for double voting", () => {
        return Election.deployed().then((app) => {
            const candidateId = 2;
            app.vote(2, { from: accounts[2] });
            return app.candidates(2);
        }).then((candidate2) => {
            assert.equal(candidate2.voteCount, 1, "accepted the first vote for candidate 2");
            return app.vote(2, { from: accounts[2] });
        }).then(assert.fail).catch((error) => {
            assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
            return app.candidates(2);
        }).then((candidate2) => {
            assert.equal(candidate2.voteCount, 1, "vote count for candidate 2 did not increase");
        })
    })



})

