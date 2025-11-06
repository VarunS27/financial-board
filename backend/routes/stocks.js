const express = require('express');
const router = express.Router();
const axios = require('axios');
const NodeCache = require('node-cache');
const { protect } = require('../middleware/auth');

// Cache for 5 minutes to avoid API rate limits
const cache = new NodeCache({ stdTTL: 300 });

// @route   GET /api/stocks/:symbol
// @desc    Get stock quote and data
// @access  Private
router.get('/:symbol', protect, async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `quote_${symbol.toUpperCase()}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Stock API not configured'
      });
    }

    // Fetch global quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const quoteResponse = await axios.get(quoteUrl);

    if (quoteResponse.data['Global Quote']) {
      const quote = quoteResponse.data['Global Quote'];
      
      const stockData = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open'])
      };

      // Cache the result
      cache.set(cacheKey, stockData);

      return res.json({
        success: true,
        data: stockData,
        cached: false
      });
    }

    res.status(404).json({
      success: false,
      message: 'Stock data not found'
    });
  } catch (error) {
    console.error('Get stock data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock data'
    });
  }
});

// @route   GET /api/stocks/:symbol/history
// @desc    Get historical stock data
// @access  Private
router.get('/:symbol/history', protect, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = 'daily' } = req.query; // daily, weekly, monthly
    const cacheKey = `history_${symbol.toUpperCase()}_${interval}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Stock API not configured'
      });
    }

    let functionName = 'TIME_SERIES_DAILY_ADJUSTED';
    let timeSeriesKey = 'Time Series (Daily)';

    if (interval === 'weekly') {
      functionName = 'TIME_SERIES_WEEKLY_ADJUSTED';
      timeSeriesKey = 'Weekly Adjusted Time Series';
    } else if (interval === 'monthly') {
      functionName = 'TIME_SERIES_MONTHLY_ADJUSTED';
      timeSeriesKey = 'Monthly Adjusted Time Series';
    }

    const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${apiKey}`;
    const response = await axios.get(url);

    if (response.data[timeSeriesKey]) {
      const timeSeries = response.data[timeSeriesKey];
      const historyData = [];

      // Convert to array format (limit to last 100 data points)
      const dates = Object.keys(timeSeries).slice(0, 100);
      
      for (const date of dates) {
        const data = timeSeries[date];
        historyData.push({
          date,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          adjustedClose: parseFloat(data['5. adjusted close']),
          volume: parseInt(data['6. volume'])
        });
      }

      // Reverse to have oldest first
      historyData.reverse();

      // Cache the result
      cache.set(cacheKey, historyData);

      return res.json({
        success: true,
        data: historyData,
        cached: false
      });
    }

    res.status(404).json({
      success: false,
      message: 'Historical data not found'
    });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock history'
    });
  }
});

// @route   GET /api/stocks/search/:query
// @desc    Search for stocks by symbol or name
// @access  Private
router.get('/search/:query', protect, async (req, res) => {
  try {
    const { query } = req.params;
    const cacheKey = `search_${query}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Stock API not configured'
      });
    }

    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.bestMatches) {
      const results = response.data.bestMatches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency']
      }));

      // Cache the result
      cache.set(cacheKey, results);

      return res.json({
        success: true,
        data: results,
        cached: false
      });
    }

    res.json({
      success: true,
      data: [],
      cached: false
    });
  } catch (error) {
    console.error('Search stocks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching stocks'
    });
  }
});

module.exports = router;
