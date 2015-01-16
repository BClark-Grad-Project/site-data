/**
 * Default data sets.
 * Author : Brandon Laurence Clark
 * License: MIT
 */

var secure  = require('site-secure');// General ssl/tls and session functions
var auth    = require('site-auth');  // General authorization functions
var user    = require('site-user');  // General user functions
var profile = require('./profile');  // Data granting and profile management
var blog    = require('site-blog');  // General blog functions

// User Management
module.exports.secure  = secure;
module.exports.user    = user; 
module.exports.auth    = auth;
module.exports.profile = profile;

// Site Management
module.exports.blog    = blog;
