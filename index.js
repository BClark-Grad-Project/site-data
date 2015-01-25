/**
 * Default data sets.
 * Author : Brandon Laurence Clark
 * License: MIT
 */

var secure  = require('site-secure');   // General ssl/tls and session data functions
var auth    = require('site-auth');     // General authorization data functions
var user    = require('site-user');     // General user data functions
var profile = require('./profile');     // Data granting and profile data management
var blog    = require('site-blog');     // General blog data functions
var project = require('site-projects'); // Project Management data functions

// User Management
module.exports.secure  = secure;
module.exports.user    = user; 
module.exports.auth    = auth;
module.exports.profile = profile;

// Site Management
module.exports.blog    = blog;

// Project Management
module.exports.project = project;