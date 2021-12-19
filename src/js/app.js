App = {
  contracts: {},

  load: async() => {
    await App.initWeb3();
    await App.loadAccount();
    await App.initContract();
    await App.render();
  },

  //connects our client side app to our local blockchain
  initWeb3: async() => {
    if (window.ethereum) { 
      console.log('MetaMask is installed!');
      App.web3Provider = window.ethereum;
    }
    //legacy dapp browsers
    else if (window.web3) {
      // Use Mist/MetaMask's provider
      console.log('Injected web3 detected.');
      App.web3Provider = window.web3.currentProvider;
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    web3 = new Web3(App.web3Provider);
  },

  loadAccount: async() => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    App.account = accounts[0];
    web3.eth.defaultAccount = web3.eth.accounts[0];
  },

  //loads smart contract into front-end of our app
  initContract: async() => {
    const election = await $.getJSON('Election.JSON');
    App.contracts.Election = TruffleContract(election);
    App.contracts.Election.setProvider(App.web3Provider);
    App.election = await App.contracts.Election.deployed();
  },

  render: async() => {
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();

    //render the account
    $('#accountAddress').html(App.account);

    //list out each candidate in our mapping
    const candidateCount = await App.election.candidatesCount();
    for(i = 1; i <= candidateCount; i++) {
      //get data from blockchain
      const candidate = await App.election.candidates(i);
      const id = candidate[0];
      const name = candidate[1];
      const voteCount = candidate[2];
      
      //create html - results
      var candidatesResults = $("#candidatesResults");
      var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
      candidatesResults.append(candidateTemplate);

      //create html -- form selections
      var candidatesSelect = $("#candidatesSelect");
      var candidateOption = "<option value='" + id + "' >" + name + "</ option>";
      candidatesSelect.append(candidateOption);
    }

    //hide the submission form if the account has already voted
    const hasVoted = await App.election.voters(App.account);
    if(hasVoted) {
      $('form').hide();
    } 

    loader.hide();
    content.show();

    //not doing this
    // App.listenForEvents();
  },

  castVote: async() => {
    const candidateId = $('#candidatesSelect').val();
    const voter = App.account;
    const receipt = await App.election.vote(candidateId, { from: voter });
    //testing events
    // console.log(receipt.logs.length);
    // console.log(receipt.logs[0].event);
    // console.log(receipt.logs[0].args._candidateId.toNumber());

    //could do also listen for event below, but running into bug where the event keeps firing over and over
    window.location.reload();
  },

  // listenForEvents: function() {
  //   App.contracts.Election.deployed().then(function(instance) {
  //     instance.votedEvent({}, {
  //       fromBlock: 0,
  //       toBlock: 'latest'
  //     }).watch(function(error, event) {
  //       console.log("event triggered", event)
  //       // Reload when a new vote is recorded
  //       // App.render();
  //     });
  //   });
  // }
}

document.addEventListener("DOMContentLoaded", function (event) {
  App.load();
});