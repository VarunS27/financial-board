const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stockSymbol: {
    type: String,
    required: [true, 'Please provide a stock symbol'],
    uppercase: true,
    trim: true
  },
  shares: {
    type: Number,
    required: [true, 'Please provide number of shares'],
    min: [0, 'Shares cannot be negative']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Please provide purchase price'],
    min: [0, 'Price cannot be negative']
  },
  addedOn: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
portfolioSchema.index({ userId: 1 });
portfolioSchema.index({ userId: 1, stockSymbol: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
