"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickDB = void 0;
const lodash_1 = require("lodash");
const error_1 = require("./error");
const utilities_1 = require("./utilities");
class QuickDB {
  static instances = new Map();
  _driver;
  tableName;
  normalKeys;
  options;
  get driver() {
    return this._driver;
  }
  constructor(options = {}) {
    options.table ??= "json";
    options.filePath ??= "json.sqlite";
    options.normalKeys ??= false;
    if (!options.driver) {
      const { SqliteDriver } = require("./drivers/SqliteDriver");
      options.driver = new SqliteDriver(options.filePath);
    }
    this.options = options;
    this._driver = options.driver;
    this.tableName = options.table;
    this.normalKeys = options.normalKeys;
  }
  async addSubtract(key, value, sub = false) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (value == null) {
      throw new error_1.CustomError("Thiếu tham số thứ hai (value)", error_1.ErrorKind.MissingValue);
    }
    let currentNumber = await this.get(key);
    if (currentNumber == null)
      currentNumber = 0;
    if (typeof currentNumber != "number") {
      try {
        currentNumber = parseFloat(currentNumber);
      }
      catch (_) {
        throw new error_1.CustomError(`Giá trị hiện tại với key: (${key}) không phải là số và không thể phân tích thành số`, error_1.ErrorKind.InvalidType);
      }
    }
    if (typeof value != "number") {
      try {
        value = parseFloat(value);
      }
      catch (_) {
        throw new error_1.CustomError(`Giá trị để cộng/trừ với key: (${key}) không phải là số và không thể phân tích thành số`, error_1.ErrorKind.InvalidType);
      }
    }
    sub ? (currentNumber -= value) : (currentNumber += value);
    await this.set(key, currentNumber);
    return currentNumber;
  }
  async getArray(key) {
    const currentArr = (await this.get(key)) ?? [];
    if (!Array.isArray(currentArr)) {
      throw new error_1.CustomError(`Giá trị hiện tại với key: (${key}) không phải là mảng`, error_1.ErrorKind.InvalidType);
    }
    return currentArr;
  }
  static registerSingleton(name, options = {}) {
    if (typeof name != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (name) cần là chuỗi, nhận được "${typeof name}"`, error_1.ErrorKind.InvalidType);
    }
    const instance = new QuickDB(options);
    this.instances.set(name, instance);
    return instance;
  }
  static getSingleton(name) {
    if (typeof name != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (name) cần là chuỗi, nhận được "${typeof name}"`, error_1.ErrorKind.InvalidType);
    }
    const instance = this.instances.get(name);
    if (!instance) {
      throw new error_1.CustomError(`Không có instance singleton nào được đăng ký với tên "${name}"`, error_1.ErrorKind.InstanceNotFound);
    }
    return instance;
  }
  async init() {
    if ((0, utilities_1.isConnectable)(this.driver)) {
      await this.driver.connect();
    }
    await this.driver.prepare(this.tableName);
  }
  async close() {
    if ((0, utilities_1.isDisconnectable)(this.driver)) {
      await this.driver.disconnect();
    }
  }
  async all() {
    return this.driver.getAllRows(this.tableName);
  }
  async get(key) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (key.includes(".") && !this.normalKeys) {
      const keySplit = key.split(".");
      const [result] = await this.driver.getRowByKey(this.tableName, keySplit[0]);
      return (0, lodash_1.get)(result, keySplit.slice(1).join("."));
    }
    const [result] = await this.driver.getRowByKey(this.tableName, key);
    return result;
  }
  async set(key, value) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (value == null) {
      throw new error_1.CustomError("Thiếu tham số thứ hai (value)", error_1.ErrorKind.MissingValue);
    }
    if (key.includes(".") && !this.normalKeys) {
      const keySplit = key.split(".");
      const [result, exist] = await this.driver.getRowByKey(this.tableName, keySplit[0]);
      let obj;
      if (result instanceof Object == false) {
        obj = {};
      }
      else {
        obj = result;
      }
      const valueSet = (0, lodash_1.set)(obj ?? {}, keySplit.slice(1).join("."), value);
      return this.driver.setRowByKey(this.tableName, keySplit[0], valueSet, exist);
    }
    const exist = (await this.driver.getRowByKey(this.tableName, key))[1];
    return this.driver.setRowByKey(this.tableName, key, value, exist);
  }
  async update(key, object) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (typeof object != "object" || object == null) {
      throw new error_1.CustomError(`Tham số thứ hai (object) cần là đối tượng, nhận được "${typeof object}"`, error_1.ErrorKind.InvalidType);
    }
    const data = (await this.get(key)) ?? {};
    if (typeof data != "object" || Array.isArray(data)) {
      throw new error_1.CustomError(`Dữ liệu hiện tại không phải là đối tượng, update chỉ hoạt động trên đối tượng`, error_1.ErrorKind.InvalidType);
    }
    for (const [k, v] of Object.entries(object)) {
      data[k] = v;
    }
    return await this.set(key, data);
  }
  async has(key) {
    return (await this.get(key)) != null;
  }
  async delete(key) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (key.includes(".")) {
      const keySplit = key.split(".");
      const obj = (await this.get(keySplit[0])) ?? {};
      (0, lodash_1.unset)(obj, keySplit.slice(1).join("."));
      return this.set(keySplit[0], obj);
    }
    return this.driver.deleteRowByKey(this.tableName, key);
  }
  async deleteAll() {
    return this.driver.deleteAllRows(this.tableName);
  }
  async add(key, value) {
    return this.addSubtract(key, value);
  }
  async sub(key, value) {
    return this.addSubtract(key, value, true);
  }
  async push(key, ...values) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (values.length === 0) {
      throw new error_1.CustomError("Thiếu tham số thứ hai (value)", error_1.ErrorKind.MissingValue);
    }
    const currentArr = await this.getArray(key);
    currentArr.push(...values);
    return this.set(key, currentArr);
  }
  async unshift(key, value) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (value == null) {
      throw new error_1.CustomError("Thiếu tham số thứ hai (value)", error_1.ErrorKind.InvalidType);
    }
    let currentArr = await this.getArray(key);
    if (Array.isArray(value))
      currentArr = value.concat(currentArr);
    else
      currentArr.unshift(value);
    return await this.set(key, currentArr);
  }
  async pop(key) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    const currentArr = await this.getArray(key);
    const value = currentArr.pop();
    await this.set(key, currentArr);
    return value;
  }
  async shift(key) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    const currentArr = await this.getArray(key);
    const value = currentArr.shift();
    await this.set(key, currentArr);
    return value;
  }
  async pull(key, value, once = false) {
    if (typeof key != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (key) cần là chuỗi, nhận được "${typeof key}"`, error_1.ErrorKind.InvalidType);
    }
    if (value == null) {
      throw new error_1.CustomError("Thiếu tham số thứ hai (value)", error_1.ErrorKind.MissingValue);
    }
    const currentArr = await this.getArray(key);
    if (!Array.isArray(value) && typeof value != "function")
      value = [value];
    const data = [];
    for (const i in currentArr) {
      if (Array.isArray(value)
        ? value.includes(currentArr[i])
        : value(currentArr[i], i))
        continue;
      data.push(currentArr[i]);
      if (once)
        break;
    }
    return await this.set(key, data);
  }
  async startsWith(query) {
    if (typeof query != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (query) cần là chuỗi, nhận được "${typeof query}"`, error_1.ErrorKind.InvalidType);
    }
    const results = await this.driver.getStartsWith(this.tableName, query);
    return results;
  }
  async table(table) {
    if (typeof table != "string") {
      throw new error_1.CustomError(`Tham số đầu tiên (table) cần là chuỗi, nhận được "${typeof table}"`, error_1.ErrorKind.InvalidType);
    }
    const options = { ...this.options };
    options.table = table;
    options.driver = this.driver;
    const instance = new QuickDB(options);
    await instance.driver.prepare(options.table);
    return instance;
  }
  useNormalKeys(activate) {
    this.normalKeys = activate;
  }
}
exports.QuickDB = QuickDB;