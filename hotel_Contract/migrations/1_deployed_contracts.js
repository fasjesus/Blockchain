// migrations/2_deploy_contracts.js

const VirtualStore = artifacts.require('VirtualStore');
module.exports = function (deployer) {
    deployer.deploy(VirtualStore);
};

const instance = VirtualStore.deployed();
console.log('Address: ');
