var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TrailerSchema = new Schema({
    unitnumber: { type: String},
    customer: { type: String},
    issue: { type: String},
    location: { type: String},
    requestedby: { type: String},
    assignedto: { type: String},
    startdate: { type: String },
    duedate: { type: String },
    percentcomplete: { type: String },
    status: { type: String },
    dateapproved: { type: String },
    tooltipnote: { type: String }
});


module.exports = mongoose.model('Trailer', TrailerSchema);