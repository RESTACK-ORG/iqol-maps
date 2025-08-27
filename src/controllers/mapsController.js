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
  //urban
  static async getUrbanGeoJSON(req, res) {
    try {
      const result = await pool.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'Name', "Name",
                'Micromarket', "Micromarket",
                'planAuth', "planAuth",
                'Region', "Region",
                'Zone', "Zone",
                'LocalAuth', "LocalAuth"
              )
            )
          )
        ) as geojson
        FROM urban_final_final;
      `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  //bbpm
  static async getBBMPGeoJSON(req, res) {
    try {
      const result = await pool.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'OBJECTID', "OBJECTID",
                'Ward_No', "Ward_No",
                'Ward_Name', "Ward_Name",
                'Zone', "Zone",
                'LocalPA', "LocalPA",
                'planAuth', "planAuth"
              )
            )
          )
        ) as geojson
        FROM "bbmp — BBMP_198_Sheet_Attributes";
      `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      console.error(error); // log error to console for real diagnostics
      res.status(500).json({ error: error.message });
    }
  }
  //rural
  static async getRuralGEOJSON(req, res) {
    try {
      const result = await pool.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'Name', "Name",
                'Micromarket', "Micromarket",
                'planAuth', "planAuth",
                'Region', "Region",
                'Zone', "Zone",
                'LocalAuth', "LocalAuth"
              )
            )
          )
        ) as geojson
        FROM "rural_final — rural sort of final";
      `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  //metro
  static async getMetroGeoJSON(req, res) {
    try {
      const result = await pool.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'name', name,
                'line', line,
                'color', color
              )
            )
          )
        ) AS geojson
        FROM metro;
      `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
  // suburban railway
  static async getSuburbanGeoJSON(req, res) {
    try {
      const result = await pool.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'name', name,
                'electrified', electrified,
                'service', service
              )
            )
          )
        ) AS geojson
        FROM suburb_railway;
      `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
  // NICE ring road
  static async getNICEGEOJSON(req, res) {
    try {
      const result = await pool.query(`
        SELECT json_build_object(
          'type', 'FeatureCollection',
          'features', json_agg(
            json_build_object(
              'type', 'Feature',
              'geometry', ST_AsGeoJSON(geom)::json,
              'properties', json_build_object(
                'id', id,
                'name', name,
                'stroke', stroke,
                'stroke_width', "stroke-width",
                'stroke_opacity', "stroke-opacity"
              )
            )
          )
        ) as geojson
        FROM "NICE_Ring_Road";
      `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  //orr
  static async getORRGEOJSON(req, res) {
    try {
      const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', json_build_object(
              'uid', uid,
              'id', id,
              'name', name
            )
          )
        )
      ) as geojson
      FROM orr_revised;
    `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  //peripheral ring road
  static async getPeripheralGEOJSON(req, res) {
    try {
      const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', json_build_object(
              'id', id
            )
          )
        )
      ) as geojson
      FROM peripheral_proposed;
    `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  //STRR Proposed
  static async getSTRRProposedGEOJSON(req, res) {
    try {
      const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', json_build_object(
              'id', id
            )
          )
        )
      ) as geojson
      FROM strr_proposed;
    `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  //STR revised
  static async getSTRRGEOJSON(req, res) {
    try {
      const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', json_build_object(
              'id', id,
              'name', name
            )
          )
        )
      ) as geojson
      FROM strr_revised;
    `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  //hightension revised
  static async gethightensionGEOJSON(req, res) {
    try {
      const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', json_build_object(
              'id', id,
              'name', name
            )
          )
        )
      ) as geojson
      FROM hightension;
    `);
      res.json(result.rows[0].geojson);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }




}

module.exports = MapsController;