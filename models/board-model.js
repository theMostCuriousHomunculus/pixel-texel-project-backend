const { model, Schema } = require('mongoose');

const messageSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    required: true,
    type: String
  }
}, {
  timestamps: true
});

const boardSchema = new Schema({
  founder: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  name: {
    index: {
      unique: true,
      collation: { locale: 'en', strength: 2 }
    },
    maxlength: 100,
    required: true,
    trim: true,
    type: String
  }
});

boardSchema.index({ name: 'text' });

const Board = model('Board', boardSchema);

const Message = model('Message', messageSchema);

module.exports = {
  Board,
  Message
};