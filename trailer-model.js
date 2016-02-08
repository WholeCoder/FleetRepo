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
    numberofsupportingdocuments: { type: Number },
    whentobearchived: { type: Date },
    note: { type: String },
    initials: { type: String},
    past_revisions: [module.exports]
});


module.exports = mongoose.model('Trailer', TrailerSchema);