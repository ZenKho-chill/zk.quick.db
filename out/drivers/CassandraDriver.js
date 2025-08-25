"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CassandraDriver = void 0;

const cassandra_driver_1 = require('cassandra-driver');
class CassandraDriver {
  static instance;
  _client;
  config;
  constructor(config) {
    this.config = config;
  }
  static createSingleton(config) {
    if (!this.instance)
      this.instance = new CassandraDriver(config);
    return this.instance;
  }
  async connect() {
    this._client = new cassandra_driver_1.Client(this.config);
    try {
      await this._client.connect();
    } catch (error) {
      throw new Error(`Lỗi khi kết nối Cassandra: ${error.message}`);
    }
  }
  async disconnect() {
    this.checkConnection();
    await this._client.shutdown();
  }
  checkConnection() {
    if (this._client === null) {
      throw new Error('Không có kết nối đến CassandraDB');
    }
  }
  async prepare(table) {
    this.checkConnection();
    await this._client.execute("CREATE KEYSPACE IF NOT EXISTS zk_quick_db WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}");
    await this._client.execute("USE zk_quick_db");
    await this._client.execute(`CREATE TABLE IF NOT EXISTS ${table} (id varchar, key varchar, value TEXT, PRIMARY KEY(id))`);
    
    // Tạo index tương thích với Cassandra v5+
    try {
      // Thử tạo SAI (Storage Attached Index) cho Cassandra 4.0+
      await this._client.execute(`CREATE CUSTOM INDEX IF NOT EXISTS ${table}_key_sai_idx ON ${table} (key) USING 'StorageAttachedIndex'`);
    } catch (saiError) {
      try {
        // Fallback: tạo B-tree index cho phiên bản cũ
        await this._client.execute(`CREATE INDEX IF NOT EXISTS ${table}_key_idx ON ${table} (key)`);
      } catch (indexError) {
        // Tiếp tục không có index - sử dụng full table scan
      }
    }
  }
  async getAllRows(table) {
    this.checkConnection();
    const queryResult = await this._client.execute(`SELECT * FROM ${table}`);
    return queryResult.rows.map((row) => ({
      id: row.key,
      value: JSON.parse(row.value),
    }));
  }
  async getStartsWith(table, query) {
    this.checkConnection();
    
    try {
      // Truy vấn tối ưu sử dụng LIKE với SAI/index
      const cqlQuery = `SELECT key, value FROM ${table} WHERE key LIKE '${query}%' ALLOW FILTERING`;
      const result = await this._client.execute(cqlQuery);
      
      return result.rows.map((row) => ({
        id: row.key,
        value: JSON.parse(row.value),
      }));
    } catch (error) {
      // Fallback: Quét toàn bộ bảng nếu truy vấn index không hoạt động
      const queryResult = await this._client.execute(`SELECT * FROM ${table}`);
      const filteredRows = queryResult.rows.filter(row => 
        row.key && row.key.startsWith(query)
      );
      
      return filteredRows.map((row) => ({
        id: row.key,
        value: JSON.parse(row.value),
      }));
    }
  }
  async getRowByKey(table, key) {
    this.checkConnection();
    const queryResult = await this._client.execute(`SELECT * FROM ${table} WHERE id = ?`, [key], { prepare: true });
    return queryResult.rowLength < 1
      ? [null, false]
      : [JSON.parse(queryResult.rows[0].value), true];
  }
  async setRowByKey(table, key, value, update) {
    this.checkConnection();
    const stringifiedValue = JSON.stringify(value);
    if (update) {
      await this._client.execute(`UPDATE ${table} SET value = ? WHERE id = ?`, [stringifiedValue, key], { prepare: true });
    } else {
      await this._client.execute(`INSERT INTO ${table} (id, key, value) VALUES (?, ?, ?)`, [key, key, stringifiedValue], { prepare: true });
    }
    return value;
  }
  async deleteAllRows(table) {
    this.checkConnection();
    // Đếm số hàng trước khi xóa
    const countResult = await this._client.execute(`SELECT COUNT(*) as count FROM ${table}`);
    const rowCount = countResult.rows[0]?.count || 0;
    
    // Xóa toàn bộ bảng
    await this._client.execute(`TRUNCATE ${table}`);
    return parseInt(rowCount);
  }
  async deleteRowByKey(table, key) {
    this.checkConnection();
    await this._client.execute(`DELETE FROM ${table} WHERE id = ?`, [key], { prepare: true });
    // Với Cassandra, giả định 1 hàng bị ảnh hưởng nếu không có lỗi
    return 1;
  }
}
exports.CassandraDriver = CassandraDriver;