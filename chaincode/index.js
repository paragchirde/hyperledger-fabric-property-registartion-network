'use strict';
const UserContract = require('./contracts/user.js');
const RegistrarContract = require('./contracts/registrar.js');
module.exports = UserContract;
module.exports = RegistrarContract;
module.exports.contracts = { UserContract, RegistrarContract };