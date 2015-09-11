var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LotWalkthroughInstanceSchema = new Schema({
    dateoflotwalkthrough: { type: Date }
});


module.exports = mongoose.model('LotWalkthroughInstance', LotWalkthroughInstanceSchema);