/**
 * RECORD SERVICE (BUSINESS LOGIC)
 * WHY:
 * - Keeps controller clean
 * - Handles DB queries + filtering logic
 *
 * WHERE USED:
 * - record.controller.js
 */

const prisma = require('../config/db');

/**
 * Create financial record
 */
const createRecord = async (userId, data) => {
  const { amount, type, category, date, notes } = data;

  /**
   * WHY:
   * - userId ensures ownership
   * - each record belongs to a user
   */
  const record = await prisma.record.create({
    data: {
      amount,
      type,
      category,
      date: new Date(date),
      notes,
      userId
    }
  });

  return record;
};

/**
 * Get records with filtering, optional search + pagination
 */
const getRecords = async (userId, query) => {
  const { type, category, startDate, endDate, q, page, limit } = query;

  const filters = {
    userId,
    deletedAt: null
  };

  if (type) {
    filters.type = type;
  }

  if (category) {
    filters.category = category;
  }

  if (startDate || endDate) {
    filters.date = {};

    if (startDate) {
      filters.date.gte = new Date(startDate);
    }

    if (endDate) {
      filters.date.lte = new Date(endDate);
    }
  }

  if (q && String(q).trim()) {
    const term = String(q).trim();
    filters.OR = [
      { category: { contains: term } },
      { notes: { contains: term } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where: filters,
      orderBy: { date: 'desc' },
      skip,
      take: limitNum
    }),
    prisma.record.count({ where: filters })
  ]);

  return {
    items: records,
    page: pageNum,
    limit: limitNum,
    total
  };
};

/**
 * Update record
 */
const updateRecord = async (recordId, userId, data) => {
  /**
   * Ensure record belongs to user
   */
  const existing = await prisma.record.findFirst({
    where: { id: recordId, userId, deletedAt: null }
  });

  if (!existing) {
    throw new Error("Record not found or unauthorized");
  }

  const payload = {};
  if (data.amount !== undefined) payload.amount = data.amount;
  if (data.type !== undefined) payload.type = data.type;
  if (data.category !== undefined) payload.category = data.category;
  if (data.date !== undefined) payload.date = new Date(data.date);
  if (data.notes !== undefined) payload.notes = data.notes;

  const updated = await prisma.record.update({
    where: { id: recordId },
    data: payload
  });

  return updated;
};

/**
 * Delete record
 */
const deleteRecord = async (recordId, userId) => {
  /**
   * Ensure ownership before deletion
   */
  const existing = await prisma.record.findFirst({
    where: { id: recordId, userId, deletedAt: null }
  });

  if (!existing) {
    throw new Error("Record not found or unauthorized");
  }

  await prisma.record.update({
    where: { id: recordId },
    data: { deletedAt: new Date() }
  });

  return true;
};

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
};