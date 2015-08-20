var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FileArchiveSchema = new Schema({
    name: { type: String},
    contents: { type: Buffer},
    mimetype: { type: String},
    customer: { type: String},
    trailer_archive_id: { type: Schema.Types.ObjectId}
});


module.exports = mongoose.model('FileArchive', FileArchiveSchema);