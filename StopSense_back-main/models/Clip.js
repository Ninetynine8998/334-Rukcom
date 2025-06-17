const mongoose = require('mongoose');

const clipSchema = new mongoose.Schema({
  clip_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 25
  },
  videopath: {
    type: String,
    required: true,
    maxlength: 255
  },
  upload_date: {
    type: Date,
    default: Date.now
  },
  number_conflict: {
    type: Number,
    default: 0
  }
});


// บอกชัดเจนว่า schema นี้ผูกกับ collection 'files'
module.exports = mongoose.model('Clip', clipSchema);

