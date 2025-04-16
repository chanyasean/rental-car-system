const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true
  },
  adminId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  details: Object,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
