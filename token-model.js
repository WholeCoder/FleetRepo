var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcryptjs'),
    SALT_WORK_FACTOR = 10,
    // these values can be whatever you want - we're defaulting to a
    // max of 5 attempts, resulting in a 2 hour lock
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;

var TokenSchema = new Schema({
    username: { type: String, required: true},
    token: { type: String, required: true },
    validuntil: { type: Number } // holds a Date
});

TokenSchema.pre('save', function(next) {
    var token = this;

    // only hash the password if it has been modified (or is new)
    if (!token.isModified('token')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(token.token, salt, function (err, hash) {
            if (err) return next(err);

            // set the hashed password back on our user document
            token.token = hash;
            next();
        });
    });
});

TokenSchema.methods.compareToken = function(candidateToken, cb) {
    bcrypt.compare(candidateToken, this.token, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


// expose enum on the model, and provide an internal convenience reference 
var reasons = TokenSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

TokenSchema.statics.getAuthenticated = function(username, token, cb) {
    this.findOne({ username: username }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // test for a matching password
        user.compareToken(token, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                // reset attempts and lock info
                return user;
            }
        });
    });
};

module.exports = mongoose.model('Token', TokenSchema);