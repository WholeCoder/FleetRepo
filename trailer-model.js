var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TrailerSchema = new Schema({
    unitnumber: { type: String, required: true},
    customer: { type: String, required: true },
    issue: { type: String, required: true },
    location: Boolean,
    requestedby: { type: String, required: true},
    assignedto: { type: String, required: true},
    startdate: { type: String },
    duedate: { type: String },
    percentcomplete: { type: String },
    status: { type: String },
    dateapproved: { type: String },
    tooltipnote: { type: String }
});


module.exports = mongoose.model('Trailer', TrailerSchema);