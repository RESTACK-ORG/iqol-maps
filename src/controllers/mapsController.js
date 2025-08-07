const pool = require('../config/database');

class MapsController {
  // Get all tables
  static async getTables(req, res) {
    try {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get table schema
  static async getTableSchema(req, res) {
    try {
      const { tableName } = req.params;
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [tableName]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Table not found' });
      }
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all records from a table
  static async getTableData(req, res) {
    try {
      const { tableName } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      
      // Validate table exists
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [tableName]);
      
      if (tableCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Table not found' });
      }
      
      const result = await pool.query(
        `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      
      const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
      
      res.json({
        data: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get specific record by ID
  static async getRecordById(req, res) {
    try {
      const { tableName, id } = req.params;
      
      // Check if table exists
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = $1 AND table_schema = 'public'
      `, [tableName]);
      
      if (tableCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Table not found' });
      }
      
      // Try to find primary key column
      const pkResult = await pool.query(`
        SELECT column_name
        FROM information_schema.key_column_usage
        WHERE table_name = $1 AND constraint_name LIKE '%_pkey'
      `, [tableName]);
      
      const pkColumn = pkResult.rows.length > 0 ? pkResult.rows[0].column_name : 'id';
      
      const result = await pool.query(
        `SELECT * FROM "${tableName}" WHERE "${pkColumn}" = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Execute custom SQL query
  static async executeQuery(req, res) {
    try {
      const { sql } = req.query;
      
      if (!sql) {
        return res.status(400).json({ error: 'SQL query is required' });
      }
      
      // Basic safety check - only allow SELECT statements
      const trimmedSql = sql.trim().toLowerCase();
      if (!trimmedSql.startsWith('select')) {
        return res.status(400).json({ error: 'Only SELECT queries are allowed' });
      }
      
      const result = await pool.query(sql);
      res.json({
        data: result.rows,
        rowCount: result.rowCount
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MapsController;