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
	var profile = {};
	var info = {};
	var newAuth = {};

	if(userObj.id){
		newAuth.id = userObj.id;
	}
	if(userObj.email){
		newAuth.email = userObj.email;
	}
	if(userObj.credentials){
		newAuth.credentials   = userObj.credentials; 
	}
	if(userObj.authorization){
		newAuth.authorization = userObj.authorization;
	}
	if(userObj.social){
		newAuth.social = userObj.social;
	}
	// Create new authentication profile.
	Auth.create(newAuth, function(err, user){
		if(err){
			return cb(err, userObj);
		} else {		
			// Use new Authentication ID to create profile detail.
			info.id = user.id;
			if(userObj.contact){
				info.contact = userObj.contact;
			}
			if(userObj.detail){
				info.detail = userObj.detail;
			}
			if(userObj.credentials){
				console.log('creating user detail');
				User.create(info, function(err, detail){
					console.log('created detail', detail);
					if(err){return cb(err, userObj);}
					
					// Register session.
					profile = merge(user, detail);

					console.log('merged user and detail', profile);
					sess.user = profile;
					
					return cb(null, profile);
				});
			} else {
				console.log('getting user detail');
				User.read(user.id, function(err, detail){
					if(err){return cb(err, userObj);}
					
					// Register session.
					profile = merge(user, detail);
					sess.user = profile;
					
					return cb(null, profile);
				});
			}
		}
	});
};


module.exports.read = function(id, cb){
	var profile = {};
	
	User.read(id, function(err, detail){
	  if(err){return cb(err, null);}
	  
	  Auth.read({id:id}, function(err, user){
		  if(err){return cb(err, null);}
		  
		  profile = merge(user, detail);
		  return cb(null, profile);		  
	  });
	});
};


module.exports.verify = function(sess, credential, cb){
	var profile = {};
	var search = {};
	var remember = {};
	var social = credential.social ? credential.social : undefined;
	
	if(social){
		search.social = social;
	} else {	
		remember = credential.remember;
		search.user = credential.user;
		search.password = credential.password;
	}
	
	// Attempt authentication
	Auth.verify(search, function(err, user){
		if(err){return cb(err, null);}
		
		// If verified get account detail.
		User.read({_id:user.id}, function(err, detail){
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
	var profile = {};
	var info = {};
   
	if(userObj.credentials){
		Auth.update({credentials:userObj.credentials, id:userObj.id}, function(err, user){
			if(err){return cb(err, null);}
			if(userObj.detail || userObj.contact){
				User.update(userObj, function(err, detail){
					if(err){return cb(err, null);}
			
					// Update registered session.
					info = merge(user, detail);
					profile = merge(sess.user, info);
					sess.user = profile;
					
					return cb(null, profile);
				});
			} else {
				// Update registered session.
				profile = merge(sess.user, user);
				sess.user = profile;
				
				return cb(null, profile);
			}
		});
	} else if(userObj.detail || userObj.contact){
		User.update(userObj, function(err, detail){
			if(err){return cb(err, null);}
	
			// Update registered session.
			profile = merge(sess.user, detail);
			sess.user = profile;
			
			return cb(null, profile);
		});
	}
};

module.exports.remove = function(sess, id, cb){	
	// Deactivate account.
	Auth.remove({id:id}, function(err, user){
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