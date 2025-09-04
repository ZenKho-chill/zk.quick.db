# ZK.Quick.DB

[![npm version](https://badge.fury.io/js/zk.quick.db.svg)](https://badge.fury.io/js/zk.quick.db)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)](https://github.com/ZenKho-chill/zk.quick.db)

> **English Documentation**: [README-en.md](README-en.md)

Thư viện trừu tượng hóa cơ sở dữ liệu mạnh mẽ, thống nhất và an toàn kiểu cho Node.js, hỗ trợ nhiều driver cơ sở dữ liệu với API nhất quán. Được xây dựng bằng TypeScript và kiểm thử toàn diện.

## 🚀 Tính Năng

- **Hỗ Trợ Đa Database**: 7 driver cơ sở dữ liệu (Memory, JSON, SQLite, MySQL, PostgreSQL, MongoDB, Cassandra)
- **API Thống Nhất**: Giao diện nhất quán trên tất cả các loại cơ sở dữ liệu
- **An Toàn Kiểu**: Hỗ trợ TypeScript đầy đủ với generics
- **Driver Union**: Kết hợp nhiều cơ sở dữ liệu để đảm bảo dự phòng
- **Singleton Pattern**: Hỗ trợ singleton tích hợp để quản lý kết nối
- **100% Test Coverage**: Kiểm thử unit và integration toàn diện
- **Sẵn Sàng Production**: Được kiểm thử kỹ lưỡng và tối ưu hóa hiệu suất

## 📦 Cài Đặt

```bash
npm install zk.quick.db
```

### Dependencies Cơ Sở Dữ Liệu

Cài đặt thêm các gói tùy theo lựa chọn cơ sở dữ liệu:

```bash
# Cho SQLite (mặc định)
npm install better-sqlite3

# Cho MySQL
npm install mysql2

# Cho PostgreSQL
npm install pg
npm install @types/pg

# Cho MongoDB
npm install mongoose

# Cho Cassandra
npm install cassandra-driver
```

## 🛠️ Bắt Đầu Nhanh

### Sử Dụng Cơ Bản

```typescript
import { QuickDB } from 'zk.quick.db';

// Tạo instance database (mặc định dùng SQLite driver)
const db = new QuickDB();

// Khởi tạo kết nối
await db.init();

// Lưu dữ liệu
await db.set('user:1', { name: 'John', age: 30 });

// Lấy dữ liệu
const user = await db.get('user:1');
console.log(user); // { name: 'John', age: 30 }

// Kiểm tra key có tồn tại
const exists = await db.has('user:1'); // true

// Xóa dữ liệu
await db.delete('user:1');

// Đóng kết nối
await db.close();
```

### Các Driver Cơ Sở Dữ Liệu

#### Memory Driver
```typescript
import { QuickDB, MemoryDriver } from 'zk.quick.db';

const db = new QuickDB({
  driver: new MemoryDriver()
});
```

#### JSON File Driver
```typescript
import { QuickDB, JSONDriver } from 'zk.quick.db';

const db = new QuickDB({
  driver: new JSONDriver('./data.json')
});
```

#### SQLite Driver
```typescript
import { QuickDB, SqliteDriver } from 'zk.quick.db';

const db = new QuickDB({
  driver: new SqliteDriver('./database.sqlite')
});
```

#### MySQL Driver
```typescript
import { QuickDB, MySQLDriver } from 'zk.quick.db';

const db = new QuickDB({
  driver: new MySQLDriver({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb'
  })
});
```

#### PostgreSQL Driver
```typescript
import { QuickDB, PostgresDriver } from 'zk.quick.db';

const db = new QuickDB({
  driver: new PostgresDriver({
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    database: 'mydb',
    port: 5432
  })
});
```

#### MongoDB Driver
```typescript
import { QuickDB, MongoDriver } from 'zk.quick.db';

const db = new QuickDB({
  driver: new MongoDriver('mongodb://localhost:27017/mydb')
});
```

#### Cassandra Driver
```typescript
import { QuickDB, CassandraDriver } from 'zk.quick.db';

const db = new QuickDB({
  driver: new CassandraDriver({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1',
    keyspace: 'mykeyspace'
  })
});
```

## 📚 Tài Liệu API

### Phương Thức Cơ Bản

#### `set(key: string, value: T, update?: boolean): Promise<T>`
Đặt giá trị cho một key.

```typescript
await db.set('user', { name: 'John', age: 30 });
await db.set('counter', 1);
```

#### `get(key: string): Promise<T | null>`
Lấy giá trị theo key.

```typescript
const user = await db.get('user');
const counter = await db.get('counter');
```

#### `has(key: string): Promise<boolean>`
Kiểm tra key có tồn tại.

```typescript
const exists = await db.has('user'); // true/false
```

#### `delete(key: string): Promise<number>`
Xóa một key.

```typescript
const deletedCount = await db.delete('user'); // Trả về 1 nếu xóa, 0 nếu không tìm thấy
```

#### `deleteAll(): Promise<number>`
Xóa tất cả key trong table hiện tại.

```typescript
const deletedCount = await db.deleteAll();
```

#### `all(): Promise<Array<{ id: string, value: T }>>`
Lấy tất cả cặp key-value.

```typescript
const allData = await db.all();
// Trả về: [{ id: 'user:1', value: {...} }, { id: 'user:2', value: {...} }]
```

#### `startsWith(query: string): Promise<Array<{ id: string, value: T }>>`
Lấy tất cả key bắt đầu bằng chuỗi query.

```typescript
const users = await db.startsWith('user:');
// Trả về tất cả key bắt đầu bằng 'user:'
```

### Thao Tác Object

#### `update(key: string, updates: Partial<T>): Promise<T>`
Cập nhật thuộc tính object.

```typescript
await db.set('user', { name: 'John', age: 30, city: 'NYC' });
await db.update('user', { age: 31, city: 'LA' });
// Kết quả: { name: 'John', age: 31, city: 'LA' }
```

### Phép Tính Số Học

#### `add(key: string, value: number): Promise<number>`
Cộng vào giá trị số.

```typescript
await db.set('counter', 10);
await db.add('counter', 5); // Kết quả: 15
```

#### `sub(key: string, value: number): Promise<number>`
Trừ từ giá trị số.

```typescript
await db.set('counter', 10);
await db.sub('counter', 3); // Kết quả: 7
```

### Thao Tác Mảng

#### `push(key: string, ...values: T[]): Promise<T[]>`
Thêm giá trị vào cuối mảng.

```typescript
await db.set('items', [1, 2, 3]);
await db.push('items', 4, 5); // Kết quả: [1, 2, 3, 4, 5]
```

#### `unshift(key: string, ...values: T[]): Promise<T[]>`
Thêm giá trị vào đầu mảng.

```typescript
await db.set('items', [3, 4, 5]);
await db.unshift('items', 1, 2); // Kết quả: [1, 2, 3, 4, 5]
```

#### `pop(key: string): Promise<T | undefined>`
Xóa và trả về phần tử cuối.

```typescript
await db.set('items', [1, 2, 3]);
const last = await db.pop('items'); // Trả về: 3, Mảng thành: [1, 2]
```

#### `shift(key: string): Promise<T | undefined>`
Xóa và trả về phần tử đầu.

```typescript
await db.set('items', [1, 2, 3]);
const first = await db.shift('items'); // Trả về: 1, Mảng thành: [2, 3]
```

#### `pull(key: string, value: T, once?: boolean): Promise<T[]>`
Xóa giá trị cụ thể khỏi mảng.

```typescript
await db.set('items', [1, 2, 3, 2, 4]);
await db.pull('items', 2); // Xóa tất cả số 2
await db.pull('items', 2, true); // Chỉ xóa số 2 đầu tiên
```

### Quản Lý Table

#### `table(tableName: string): QuickDB<T>`
Chuyển sang table khác.

```typescript
const usersTable = db.table('users');
const postsTable = db.table('posts');

await usersTable.set('john', { name: 'John', age: 30 });
await postsTable.set('post1', { title: 'Hello World' });
```

### Quản Lý Kết Nối

#### `init(): Promise<void>`
Khởi tạo kết nối.

```typescript
await db.init();
```

#### `close(): Promise<void>`
Đóng kết nối.

```typescript
await db.close();
```

### Singleton Pattern

#### `registerSingleton(name: string, options?: QuickDBOptions): QuickDB`
Đăng ký instance singleton.

```typescript
const db1 = QuickDB.registerSingleton('main-db');
const db2 = QuickDB.getSingleton('main-db');
// db1 === db2 (cùng instance)
```

#### `getSingleton(name: string): QuickDB`
Lấy instance singleton hiện có.

```typescript
const db = QuickDB.getSingleton('main-db');
```

#### `getSingleton(name: string): QuickDB`
Lấy instance singleton hiện có.

```typescript
const db = QuickDB.getSingleton('main-db');
```

### Tùy Chọn Cấu Hình

#### `useNormalKeys(activate: boolean): void`
Bật/tắt chế độ normal keys.

```typescript
db.useNormalKeys(true); // Tắt dot notation parsing
```

## 🔗 Driver Union

Kết hợp nhiều cơ sở dữ liệu để dự phòng và hiệu suất:

```typescript
import { QuickDB, DriverUnion, MemoryDriver, JSONDriver, SqliteDriver } from 'zk.quick.db';

const union = new DriverUnion([
  new MemoryDriver(),      // Cache nhanh
  new JSONDriver(),        // Backup file
  new SqliteDriver()       // Lưu trữ bền vững
]);

const db = new QuickDB({ driver: union });

// Dữ liệu được ghi vào tất cả driver
await db.set('key', 'value');

// Dữ liệu được đọc từ driver chính (mặc định là đầu tiên)
const value = await db.get('key');
```

### Cấu Hình Union

```typescript
const union = new DriverUnion([
  new MemoryDriver(),
  new SqliteDriver(),
  new MySQLDriver(config)
], {
  mainDriverIndex: 1  // Dùng SqliteDriver làm chính
});
```

## ⚙️ Tùy Chọn Cấu Hình

```typescript
interface QuickDBOptions<D extends DatabaseDriver> {
  table?: string;           // Tên table/collection (mặc định: 'json')
  filePath?: string;        // Đường dẫn file cho file-based drivers
  driver?: D;              // Instance database driver
  normalKeys?: boolean;     // Bật chế độ normal key (mặc định: false)
}
```

### Chế Độ Normal Keys

Khi bật, ngăn phân tích tự động dot notation:

```typescript
const db = new QuickDB({ normalKeys: true });
await db.set('user.name', 'John'); // Lưu như key literal 'user.name'
```
## 📊 Hiệu Suất

Benchmark trên các thao tác khác nhau:

| Thao Tác | Memory | JSON | SQLite | MySQL | PostgreSQL | MongoDB | Cassandra |
|----------|---------|------|--------|-------|------------|---------|-----------|
| Set (1k) | ~1ms   | ~10ms | ~50ms  | ~100ms | ~80ms     | ~120ms  | ~200ms    |
| Get (1k) | ~0.5ms | ~5ms  | ~20ms  | ~50ms  | ~40ms     | ~60ms   | ~100ms    |
| Bulk (10k)| ~50ms | ~500ms| ~2s    | ~5s    | ~4s       | ~8s     | ~15s      |

## 🔧 Sử Dụng Nâng Cao

### Quản Lý Kết Nối

```typescript
// Quản lý kết nối thủ công
await db.init();  // Khởi tạo kết nối
await db.close(); // Đóng kết nối

// Trạng thái kết nối
console.log(db.isReady); // true/false
```

### Xử Lý Lỗi

```typescript
import { CustomError, ErrorKind } from 'zk.quick.db';

try {
  await db.get('nonexistent');
} catch (error) {
  if (error instanceof CustomError) {
    console.log(error.kind); // ErrorKind enum
    console.log(error.message);
  }
}
```

### An Toàn Kiểu

```typescript
interface User {
  name: string;
  age: number;
  email?: string;
}

const db = new QuickDB<User>();

// TypeScript sẽ ép kiểu interface User
await db.set('user:1', { name: 'John', age: 30 });
const user: User | null = await db.get('user:1');
```

## 🛡️ Biến Môi Trường

Cho integration test và kết nối cơ sở dữ liệu:

```bash
# file .env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=testdb

POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=testdb

MONGODB_URI=mongodb://localhost:27017/testdb

CASSANDRA_HOSTS=localhost
CASSANDRA_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=testkeyspace
```

## 📄 Giấy Phép

Giấy phép MIT - xem file [LICENSE](LICENSE) để biết chi tiết.

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Thực hiện thay đổi
4. Thêm test cho tính năng mới
5. Đảm bảo tất cả test pass
6. Gửi pull request

## 📚 Tài Liệu

Để biết tài liệu và ví dụ chi tiết hơn, hãy truy cập [GitHub repository](https://github.com/ZenKho-chill/zk.quick.db) của chúng tôi.

## 🐛 Báo Lỗi

Nếu bạn gặp bất kỳ vấn đề nào, vui lòng báo cáo trên [GitHub Issues page](https://github.com/ZenKho-chill/zk.quick.db/issues) của chúng tôi.

---

Được tạo với ❤️ bởi [ZenKho-chill](https://github.com/ZenKho-chill)
