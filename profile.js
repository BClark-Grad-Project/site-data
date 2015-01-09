var Secure = require('site-secure');
var Auth   = require('site-auth');
var User   = require('site-user');

var merge = function(obj1,obj2){
    var obj3 = {};
    for (var attr1 in obj1) { obj3[attr1] = obj1[attr1]; }
    for (var attr2 in obj2) { obj3[attr2] = obj2[attr2]; }
    return obj3;
};

// Binds (auth, secure, user).
module.exports.create = function(sess, userObj, cb){	
	console.log('site-data', userObj);
	var profile = {};
	var credentials = {};
	var info = {};
	
	// Create new authentication profile.
	credentials = userObj.credentials;
	Auth.create(credentials, function(err, user){
		if(err){return cb(err, null);}
		
		// Use new Authentication ID to create profile detail.
		info.id = user.id;
		info = merge(userObj.detail, userObj.contact);
		User.create(info, function(err, detail){
			if(err){return cb(err, null);}
			
			// Register session.
			profile = merge(user, detail);
			sess.user = profile;
			
			return cb(null, profile);
		});
	});
};


module.exports.read = function(id, cb){
	console.log('site-data', id);
	var profile = {};
	
	User.read(id, function(err, detail){
	  if(err){return cb(err, null);}
	  
	  Auth.read(id, function(err, user){
		  if(err){return cb(err, null);}
		  
		  profile = merge(user, detail);
		  return cb(null, profile);		  
	  });
	  
	});
};


module.exports.verify = function(sess, credential, cb){
	console.log('site-data', credentials);
	var profile = {};
	var remember = credentials.remember;
	delete credentials.remember;
	
	// Attempt authentication
	Auth.verify(credential, function(err, user){
		if(err){return cb(err, null);}
		
		// If verified get account detail.
		User.read({_id: user.id}, function(err, detail){
			if(err){return cb(err, null);}
			
			// Register session.
			profile = merge(user, detail);
			sess.user = profile;
			if(remember){
				// TODO Is there a better way than extending time?
			}
			
			return cb(null, profile);
		});
	});
};

module.exports.update = function(sess, userObj, cb){
	console.log('site-data', userObj);
	var profile = {};
   
	Auth.update(userObj, function(err, user){
		if(err){return cb(err, null);}
		
		User.update(userObj, function(err, detail){
			if(err){return cb(err, null);}
	
			// Update registered session.
			profile = merge(user, detail);
			profile = merge(sess.user, profile);
			sess.user = profile;
			
			return cb(null, profile);
		});
	});
};

module.exports.remove = function(sess, id, cb){	
	console.log('site-data', id);
	// Deactivate account.
	Auth.remove(id, function(err, user){
		if(err){return cb(err, null);}
		
		// Remove contact information, deactivate detail.
		User.remove(id, function(err, detail){
			// TODO Ignore error check for now.  Come back when situation response mechanism is in place.
			
			// Unregister session.
			Secure.destroy(sess, function(fail, success){
				if(fail){
					return cb(fail, null);
				} else {
					return cb(null, success);					
				}
			});			
		});
	});
};