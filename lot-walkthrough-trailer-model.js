var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LotWalkthroughTrailerSchema = new Schema({
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
    lot_walkthrough_trailer_id: { type: Schema.Types.ObjectId},
    updatedalready: { type: Boolean, default: false },
    initials: { type: String },
    past_revisions: [module.exports],
    when_this_revision_saved: { type: Date }
});


module.exports = mongoose.model('LotWalkthroughTrailer', LotWalkthroughTrailerSchema);