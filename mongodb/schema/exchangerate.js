const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  rate: {
    type: Number,
  },
  displayName: {
    type: String,
  },
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
