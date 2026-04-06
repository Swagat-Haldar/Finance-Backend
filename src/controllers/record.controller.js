/**
 * RECORD CONTROLLER
 * WHY:
 * - Handles HTTP request/response
 * - Delegates logic to service layer
 */

const recordService = require('../services/record.service');

/**
 * Create record
 */
const create = async (req, res) => {
  try {
    const record = await recordService.createRecord(req.user.id, req.body);

    res.status(201).json({
      message: "Record created",
      record
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get records
 */
const getAll = async (req, res) => {
  try {
    const records = await recordService.getRecords(req.user.id, req.query);

    res.status(200).json(records);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Update record
 */
const update = async (req, res) => {
  try {
    const updated = await recordService.updateRecord(
      req.params.id,
      req.user.id,
      req.body
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * Delete record
 */
const remove = async (req, res) => {
  try {
    await recordService.deleteRecord(req.params.id, req.user.id);

    res.status(200).json({ message: "Record deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  update,
  remove
};