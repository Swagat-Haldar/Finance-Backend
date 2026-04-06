/**
 * DASHBOARD CONTROLLER
 *
 * WHY:
 * - Handles request/response
 * - Delegates logic to service
 */

const dashboardService = require('../services/dashboard.service');

/**
 * Summary API
 */
const summary = async (req, res) => {
  try {
    const data = await dashboardService.getSummary(req.user.id);

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Category breakdown API
 */
const category = async (req, res) => {
  try {
    const data = await dashboardService.getCategoryBreakdown(req.user.id);

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Trends API
 */
const trends = async (req, res) => {
  try {
    const granularity = req.query.granularity;
    const data = await dashboardService.getTrends(req.user.id, granularity);

    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Recent activity feed
 */
const recent = async (req, res) => {
  try {
    const data = await dashboardService.getRecentActivity(
      req.user.id,
      req.query.limit
    );

    res.status(200).json({ items: data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  summary,
  category,
  trends,
  recent
};