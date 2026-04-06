/**
 * DASHBOARD SERVICE
 *
 * WHY:
 * - Handles aggregation logic
 * - Keeps controller clean
 *
 * WHERE USED:
 * - dashboard.controller.js
 */

const prisma = require('../config/db');

const startOfWeekMonday = (d) => {
  const x = new Date(d.getTime());
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

/**
 * Get summary (income, expense, balance)
 */
const getSummary = async (userId) => {
  /**
   * Aggregate total income
   */
  const income = await prisma.record.aggregate({
    where: {
      userId,
      type: "INCOME",
      deletedAt: null
    },
    _sum: {
      amount: true
    }
  });

  /**
   * Aggregate total expense
   */
  const expense = await prisma.record.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      deletedAt: null
    },
    _sum: {
      amount: true
    }
  });

  const totalIncome = income._sum.amount || 0;
  const totalExpense = expense._sum.amount || 0;

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense
  };
};

/**
 * Category-wise breakdown
 */
const getCategoryBreakdown = async (userId) => {
  /**
   * Group by category
   */
  const data = await prisma.record.groupBy({
    by: ['category'],
    where: { userId, deletedAt: null },
    _sum: {
      amount: true
    }
  });

  /**
   * Convert to object format
   */
  const result = {};

  data.forEach(item => {
    result[item.category] = item._sum.amount;
  });

  return result;
};

/**
 * Trends by month (default) or week (?granularity=week uses ISO week bucket by Monday date)
 */
const getTrends = async (userId, granularity = 'month') => {
  const mode = granularity === 'week' ? 'week' : 'month';

  const records = await prisma.record.findMany({
    where: { userId, deletedAt: null }
  });

  const buckets = {};

  records.forEach((rec) => {
    const date = new Date(rec.date);
    let key;
    if (mode === 'week') {
      const monday = startOfWeekMonday(date);
      key = monday.toISOString().slice(0, 10);
    } else {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }

    if (!buckets[key]) {
      buckets[key] = {
        income: 0,
        expense: 0
      };
    }

    if (rec.type === 'INCOME') {
      buckets[key].income += rec.amount;
    } else {
      buckets[key].expense += rec.amount;
    }
  });

  return {
    granularity: mode,
    buckets
  };
};

/**
 * Recent transactions for dashboard feed (newest first)
 */
const getRecentActivity = async (userId, limit = 10) => {
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  return prisma.record.findMany({
    where: { userId, deletedAt: null },
    orderBy: { date: 'desc' },
    take,
    select: {
      id: true,
      amount: true,
      type: true,
      category: true,
      date: true,
      notes: true,
      createdAt: true
    }
  });
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getRecentActivity
};