"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDriver = void 0;
const mongoose_1 = require('mongoose');

class MongoDriver {
  url;
  options;
  conn;
  models = new Map();
  docSchema;
  constructor(url, options = {}, pluralizeP = false) {
    this.url = url;
    this.options = options;
    if (!pluralizeP)
      (0, mongoose_1.pluralize)(null);
    this.docSchema = new mongoose_1.Schema({
      ID: {
        type: mongoose_1.SchemaTypes.String,
        required: true,
        unique: true,
      },
      data: {
        type: mongoose_1.SchemaTypes.Mixed,
        required: false,
      },
      expireAt: {
        type: mongoose_1.SchemaTypes.Date,
        required: false,
        default: null,
      },
    }, {
      timestamps: true,
    });
  }
  async connect() {
    const connection = await (0, mongoose_1.createConnection)(this.url, this.options).asPromise();
    this.conn = connection;
    return this;
  }
  async disconnect() {
    return await this.conn?.close();
  }
  checkConnection() {
    if (this.conn == null)
      throw new Error(`MongoDriver đang không kết nối tới database!`);
  }
  async prepare(table) {
    this.checkConnection();
    
    if (!table || typeof table !== 'string' || table.trim().length === 0) {
      throw new Error('Collection name cannot be empty or invalid');
    }
    
    if (!this.models.has(table))
      this.models.set(table, this.modelSchema(table));
  }
  async getModel(name) {
    await this.prepare(name);
    return this.models.get(name);
  }
  async getAllRows(table) {
    this.checkConnection();
    const model = await this.getModel(table);
    return (await model.find()).map((row) => ({
      id: row.ID,
      value: row.data,
    }));
  }
  async getRowByKey(table, key) {
    this.checkConnection();
    const model = await this.getModel(table);
    const res = await model.findOne({ ID: key });
    return res ? [res.data, true] : [null, false];
  }
  async getStartsWith(table, query) {
    this.checkConnection();
    const model = await this.getModel(table);
    const res = await model.find({
      ID: {
        $regex: new RegExp(query, 'i'),
      },
    });
    return res.map((row) => ({
      id: row.ID,
      value: row.data,
    }));
  }
  async setRowByKey(table, key, value, _update) {
    this.checkConnection();
    const model = await this.getModel(table);
    
    // For MongoDB, we want to preserve Date objects and not convert undefined to null
    // Only remove undefined at the top level, preserve Date objects
    const cleanValue = this.cleanValue(value);
    
    await model?.findOneAndUpdate({
      ID: key,
    }, {
      $set: { data: cleanValue },
    }, { upsert: true });
    return value;
  }

  cleanValue(obj) {
    if (obj instanceof Date) {
      return obj; // Preserve Date objects
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanValue(item));
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) { // Remove undefined fields
          cleaned[key] = this.cleanValue(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  }
  async deleteAllRows(table) {
    this.checkConnection();
    const model = await this.getModel(table);
    const res = await model?.deleteMany();
    return res.deletedCount;
  }
  async deleteRowByKey(table, key) {
    this.checkConnection();
    const model = await this.getModel(table);
    const res = await model?.deleteMany({
      ID: key,
    });
    return res.deletedCount;
  }
  modelSchema(modelName = 'JSON') {
    this.checkConnection();
    const model = this.conn.model(modelName, this.docSchema);
    model.collection
      .createIndex({ exporeAt: 1 }, { expireAfterSeconds: 0 })
      .catch(() => {});
    return model;
  }
}
exports.MongoDriver = MongoDriver;