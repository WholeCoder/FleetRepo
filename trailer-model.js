var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TrailerSchema = new Schema({
    unitnumber: { type: String},
    customer: { type: String},
    account: { type: String},
    vehicletype: { type: String},
    location: { type: String},
    datersnotified: { type: String },
    dateapproved: { type: String },
    estimatedtimeofcompletion: { type: String },
    status1: { type: String },
    status2: { type: String },
    status3: { type: String },
    percentcomplete: { type: String }
});


module.exports = mongoose.model('Trailer', TrailerSchema);