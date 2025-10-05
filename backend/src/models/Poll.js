// src/models/Poll.js
import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false }); // _id: false prevents Mongoose from adding an _id to subdocuments

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [OptionSchema],
  results: { type: Map, of: Number, required: true },
  correctOptionId: { type: String, required: true },
  totalSubmissions: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Poll = mongoose.model('Poll', PollSchema);

export default Poll;