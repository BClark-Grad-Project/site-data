/**
 * Default data sets.
 * Author : Brandon Laurence Clark
 * License: MIT
 */

var secure = require('site-secure');
var auth   = require('site-auth');
var user   = require('site-user');

var merge = function(obj1,obj2){
    var obj3 = {};
    for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
};

module.exports.secure = secure;
module.exports.user   = user; 
module.exports.auth   = auth;

// Overloaded to secure data exchange. Binds (auth, secure, user).
module.exports.auth.create = function(sess, userObj, cb){	
	var profile = {};
	var credentials, info;
	
	// Create new authentication profile.
	credentials = userObj.credentials;
	auth.create(credentials, function(err, user){
		if(err){return cb(err, null);}
		
		// Use new Authentication ID to create profile detail.
		info.id = user.id;
		info = merge(userObj.detail, userObj.contact);
		user.create(info, function(err, detail){
			if(err){return cb(err, null);}
			
			// Register session.
			profile = merge(user, detail);
			sess.user = profile;
			
			return cb(null, profile);
		});
	});
};

module.exports.auth.verify = function(sess, credential, cb){
	var profile = {};
	
	// Attempt authentication
	auth.verify(credential, function(err, user){
		if(err){return cb(err, null);}
		
		// If verified get account detail.
		user.read({_id: user.id}, function(err, detail){
			if(err){return cb(err, null);}
			
			// Register session.
			profile = merge(user, detail);
			sess.user = profile;
			
			return cb(null, profile);
		});
	});
};

module.exports.auth.remove = function(sess, id, cb){	
	// Deactivate account.
	auth.remove(id, function(err, user){
		if(err){return cb(err, null);}
		
		// Remove contact information, deactivate detail.
		user.remove(id, function(err, detail){
			// TODO Ignore error check for now.  Come back when situation response mechanism is in place.
			
			// Unregister session.
			secure.destroy(sess, function(fail, success){
				if(fail){
					return cb(fail, null);
				} else {
					return cb(null, success);					
				}
			});			
		});
	});
};

module.exports.auth.update = function(sess, userObj, cb){
	var profile = {};
	
	auth.update(userObj, function(err, user){
		if(err){return cb(err, null);}
		
		// Update registered session.
		profile = merge(sess.user, user);
		sess.user = profile;
		
		return cb(null, user);
	});
};

module.exports.user.update = function(sess, userObj, cb){
	var profile = {};
	
	user.update(userObj, function(err, user){
		if(err){return cb(err, null);}

		// Update registered session.
		profile = merge(sess.user, user);
		sess.user = profile;
		
		return cb(null, user);
	});
};