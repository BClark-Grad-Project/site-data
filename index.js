/**
 * Default data sets.
 * Author : Brandon Laurence Clark
 * License: MIT
 */

var secure  = require('site-secure');
var auth    = require('site-auth');
var user    = require('site-user');
var profile = require('./profile');

module.exports.secure  = secure;
module.exports.user    = user; 
module.exports.auth    = auth;
module.exports.profile = profile;
