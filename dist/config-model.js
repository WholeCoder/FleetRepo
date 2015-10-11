var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConfigSchema = new Schema({
    nextsenddailyemail: { type: Date }
});


module.exports = mongoose.model('Config', ConfigSchema);