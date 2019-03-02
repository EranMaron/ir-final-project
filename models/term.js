const mongoose = require(`mongoose`);

const locationSchema = new Schema({
  document: { type: Number, ref: `Documents`, required: true }, //document number
  hits: { type: Number, required: true }
});

const termSchema = new Schema(
  {
    word: { type: String, required: true },
    //soundexCode: { type: String, required: true },
    locations: [{ type: locationSchema, required: true }]
  },
  { collection: `terms` }
);

module.exports = mongoose.model(`Term`, termSchema);
