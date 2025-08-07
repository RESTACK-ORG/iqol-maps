const pool = require('../config/database');

class HealthController {
  static async checkHealth(req, res) {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json({ status: 'healthy', timestamp: result.rows[0].now });
    } catch (error) {
      res.status(500).json({ status: 'unhealthy', error: error.message });
    }
  }
}

module.exports = HealthController;