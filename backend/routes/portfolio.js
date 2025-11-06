const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');
const axios = require('axios');

// @route   POST /api/portfolio
// @desc    Add stock to portfolio
// @access  Private
router.post('/', protect, [
  body('stockSymbol').trim().notEmpty().withMessage('Stock symbol is required'),
  body('shares').isFloat({ min: 0 }).withMessage('Shares must be a positive number'),
  body('purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be a positive number')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { stockSymbol, shares, purchasePrice } = req.body;

    // Check if stock already exists in portfolio
    const existingStock = await Portfolio.findOne({
      userId: req.user.id,
      stockSymbol: stockSymbol.toUpperCase()
    });

    if (existingStock) {
      // Update existing stock (add more shares)
      existingStock.shares += parseFloat(shares);
      // Calculate weighted average purchase price
      const totalValue = (existingStock.purchasePrice * (existingStock.shares - shares)) + 
                        (purchasePrice * shares);
      existingStock.purchasePrice = totalValue / existingStock.shares;
      await existingStock.save();

      return res.json({
        success: true,
        portfolio: existingStock
      });
    }

    // Create new portfolio entry
    const portfolio = await Portfolio.create({
      userId: req.user.id,
      stockSymbol: stockSymbol.toUpperCase(),
      shares,
      purchasePrice
    });

    res.status(201).json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('Add to portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/portfolio
// @desc    Get user's portfolio with current prices
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const portfolioItems = await Portfolio.find({ userId: req.user.id });

    if (portfolioItems.length === 0) {
      return res.json({
        success: true,
        portfolio: [],
        summary: {
          totalValue: 0,
          totalInvestment: 0,
          totalGainLoss: 0,
          totalGainLossPercentage: 0
        }
      });
    }

    // Fetch current prices for all stocks
    const enrichedPortfolio = [];
    let totalValue = 0;
    let totalInvestment = 0;

    for (const item of portfolioItems) {
      try {
        const currentPrice = await getCurrentStockPrice(item.stockSymbol);
        const currentValue = item.shares * currentPrice;
        const investmentValue = item.shares * item.purchasePrice;
        const gainLoss = currentValue - investmentValue;
        const gainLossPercentage = (gainLoss / investmentValue) * 100;

        totalValue += currentValue;
        totalInvestment += investmentValue;

        enrichedPortfolio.push({
          ...item.toObject(),
          currentPrice,
          currentValue,
          investmentValue,
          gainLoss,
          gainLossPercentage
        });
      } catch (error) {
        console.error(`Error fetching price for ${item.stockSymbol}:`, error.message);
        // Include item with null current data if API fails
        enrichedPortfolio.push({
          ...item.toObject(),
          currentPrice: null,
          currentValue: null,
          investmentValue: item.shares * item.purchasePrice,
          gainLoss: null,
          gainLossPercentage: null
        });
      }
    }

    const totalGainLoss = totalValue - totalInvestment;
    const totalGainLossPercentage = totalInvestment > 0 
      ? (totalGainLoss / totalInvestment) * 100 
      : 0;

    res.json({
      success: true,
      portfolio: enrichedPortfolio,
      summary: {
        totalValue,
        totalInvestment,
        totalGainLoss,
        totalGainLossPercentage
      }
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/portfolio/:id
// @desc    Get single portfolio item
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Make sure user owns portfolio item
    if (portfolioItem.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      portfolio: portfolioItem
    });
  } catch (error) {
    console.error('Get portfolio item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio item
// @access  Private
router.put('/:id', protect, [
  body('shares').optional().isFloat({ min: 0 }).withMessage('Shares must be a positive number'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be a positive number')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    let portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Make sure user owns portfolio item
    if (portfolioItem.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    portfolioItem = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      portfolio: portfolioItem
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/portfolio/:id
// @desc    Delete portfolio item
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Make sure user owns portfolio item
    if (portfolioItem.userId.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await portfolioItem.deleteOne();

    res.json({
      success: true,
      message: 'Portfolio item deleted'
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to get current stock price
async function getCurrentStockPrice(symbol) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  
  const response = await axios.get(url);
  
  if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
    return parseFloat(response.data['Global Quote']['05. price']);
  }
  
  throw new Error(`Unable to fetch price for ${symbol}`);
}

module.exports = router;
