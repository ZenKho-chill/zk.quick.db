"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLDriver = void 0;
const promise_1 = require('mysql2/promise');

class MySQLDriver {
  static instance;
  conn;
  config;
  constructor(config) {
    this.config = config;
  }
  static createSingleton(config) {
    if (!this.instance)
      this.instance = new MySQLDriver(config);
    return this.instance;
  }
  checkConnection() {
    if (!this.conn) {
      throw new Error(`MySQLDriver đang không kết nối tới database!`);
    }
  }
  async connect() {
    if (typeof this.config === 'string') {
      this.conn = (0, promise_1.createPool)(this.config);
    } else {
      this.conn = (0, promise_1.createPool)(this.config);
    }
    
    try {
      await this.conn.query('SELECT 1');
    } catch (error) {
      throw new Error(`Không thể kết nối MySQL: ${error.message}`);
    }
  }
  async disconnect() {
    this.checkConnection();
    await this.conn.end();
  }
  async prepare(table) {
    this.checkConnection();
    await this.conn.query(`CREATE TABLE IF NOT EXISTS ${table} (ID VARCHAR(255) PRIMARY KEY, json TEXT)`);
  }
  async getAllRows(table) {
    this.checkConnection();
    const [rows] = await this.conn.query(`SELECT * FROM ${table}`);
    return rows.map((row) => {
      if (!row.json) return { id: row.ID, value: null };
      
      const parsed = JSON.parse(row.json);
      // Handle special Buffer format
      if (parsed && typeof parsed === 'object' && parsed.__isBuffer && parsed.data) {
        return { id: row.ID, value: Buffer.from(parsed.data) };
      }
      
      return { id: row.ID, value: parsed };
    });
  }
  async getStartsWith(table, query) {
    this.checkConnection();
    const [rows] = await this.conn.query(`SELECT * FROM ${table} where ID LIKE ?`, [`${query}%`]);
    return rows.map((row) => ({
      id: row.ID,
      value: row.json ? JSON.parse(row.json) : null,
    }));
  }
  async getRowByKey(table, key) {
    this.checkConnection();
    const [rows] = await this.conn.query(`SELECT * FROM ${table} WHERE ID = ?`, [key]);
    if (rows.length == 0)
      return [null, false];
    
    if (!rows[0].json) return [null, true];
    
    const parsed = JSON.parse(rows[0].json);
    // Handle special Buffer format
    if (parsed && typeof parsed === 'object' && parsed.__isBuffer && parsed.data) {
      return [Buffer.from(parsed.data), true];
    }
    
    return [parsed, true];
  }
  async setRowByKey(table, key, value, update) {
    this.checkConnection();
    let stringifiedJson;
    
    // Handle Buffer objects specially
    if (Buffer.isBuffer(value)) {
      stringifiedJson = JSON.stringify({
        __isBuffer: true,
        data: Array.from(value)
      });
    } else {
      stringifiedJson = JSON.stringify(value);
    }
    
    if (update) {
      await this.conn.query(`UPDATE ${table} SET json = ? WHERE ID = ?`, [stringifiedJson, key]);
    } else {
      await this.conn.query(
        `INSERT INTO ${table} (ID, json) VALUES (?, ?) ON DUPLICATE KEY UPDATE json = VALUES(json)`,
        [key, stringifiedJson]
      );
    }
    return value;
  }
  async deleteAllRows(table) {
    this.checkConnection();
    const [rows] = await this.conn.query(`DELETE FROM ${table}`);
    return rows.affectedRows;
  }
  async deleteRowByKey(table, key) {
    this.checkConnection();
    const [rows] = await this.conn.query(`DELETE FROM ${table} WHERE ID = ?`, [key]);
    return rows.affectedRows;
  }
}
exports.MySQLDriver = MySQLDriver;