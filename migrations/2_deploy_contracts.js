//artifacts represents the contract abstraction that's specific to truffle
//gives an "election artifact" that represents the smart contract
var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Election);
};