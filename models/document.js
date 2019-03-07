const mongoose = require(`mongoose`);

const documentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    description: { type: String, required: false },
    content: { type: String, required: true },
    documentNumber: { type: Number, required: true }
  },
  { collection: `documents` }
);

module.exports = mongoose.model(`Document`, documentSchema);


