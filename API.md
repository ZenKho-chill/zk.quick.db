# API Quick Reference

## Installation
```bash
npm install zk.quick.db
```

## Basic Usage
```typescript
import { QuickDB } from 'zk.quick.db';

const db = new QuickDB();
await db.init();

// Set data
await db.set('key', 'value');

// Get data
const value = await db.get('key');

// Delete data
await db.delete('key');

await db.close();
```

## Database Drivers

| Driver | Import | Constructor |
|--------|---------|-------------|
| Memory | `MemoryDriver` | `new MemoryDriver()` |
| JSON | `JSONDriver` | `new JSONDriver('./data.json')` |
| SQLite | `SqliteDriver` | `new SqliteDriver('./db.sqlite')` |
| MySQL | `MySQLDriver` | `new MySQLDriver(config)` |
| PostgreSQL | `PostgresDriver` | `new PostgresDriver(config)` |
| MongoDB | `MongoDriver` | `new MongoDriver('mongodb://...')` |
| Cassandra | `CassandraDriver` | `new CassandraDriver(config)` |

## Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `set(key, value)` | Set value for key | `Promise<T>` |
| `get(key)` | Get value by key | `Promise<T \| null>` |
| `has(key)` | Check if key exists | `Promise<boolean>` |
| `delete(key)` | Delete key | `Promise<number>` |
| `deleteAll()` | Delete all keys | `Promise<number>` |
| `all()` | Get all key-value pairs | `Promise<Array<{id, value}>>` |
| `startsWith(query)` | Get keys starting with query | `Promise<Array<{id, value}>>` |

## Object Operations

| Method | Description | Returns |
|--------|-------------|---------|
| `update(key, updates)` | Update object properties | `Promise<T>` |

## Arithmetic Operations

| Method | Description | Returns |
|--------|-------------|---------|
| `add(key, value)` | Add to numeric value | `Promise<number>` |
| `sub(key, value)` | Subtract from numeric value | `Promise<number>` |

## Array Operations

| Method | Description | Returns |
|--------|-------------|---------|
| `push(key, ...values)` | Add to end of array | `Promise<T[]>` |
| `unshift(key, value)` | Add to beginning of array | `Promise<T[]>` |
| `pop(key)` | Remove from end of array | `Promise<T \| undefined>` |
| `shift(key)` | Remove from beginning of array | `Promise<T \| undefined>` |
| `pull(key, value, once?)` | Remove value from array | `Promise<T[]>` |

## Table Management

| Method | Description | Returns |
|--------|-------------|---------|
| `table(name)` | Switch to different table | `QuickDB<T>` |

## Connection Management

| Method | Description | Returns |
|--------|-------------|---------|
| `init()` | Initialize connection | `Promise<void>` |
| `close()` | Close connection | `Promise<void>` |
| `useNormalKeys(activate)` | Enable/disable normal keys mode | `void` |

## Singleton Pattern

| Method | Description | Returns |
|--------|-------------|---------|
| `registerSingleton(name, options?)` | Register singleton | `QuickDB` |
| `getSingleton(name)` | Get singleton | `QuickDB` |

## Driver Union

```typescript
import { DriverUnion, MemoryDriver, SqliteDriver } from 'zk.quick.db';

const union = new DriverUnion([
  new MemoryDriver(),
  new SqliteDriver('./backup.sqlite')
]);

const db = new QuickDB({ driver: union });
```

## Configuration Options

```typescript
interface QuickDBOptions<D extends DatabaseDriver> {
  table?: string;           // Default: 'json'
  filePath?: string;        // For file-based drivers
  driver?: D;              // Database driver
  normalKeys?: boolean;     // Default: false
}
```

## Normal Keys Mode

When enabled, disables automatic dot notation parsing:

```typescript
const db = new QuickDB({ normalKeys: true });
await db.set('user.name', 'John'); // Stored as literal key 'user.name'

db.useNormalKeys(true); // Enable at runtime
```

## Error Handling

```typescript
import { CustomError, ErrorKind } from 'zk.quick.db';

try {
  await db.get('key');
} catch (error) {
  if (error instanceof CustomError) {
    console.log(error.kind); // ErrorKind enum
  }
}
```

## TypeScript Usage

```typescript
interface User {
  name: string;
  age: number;
}

const db = new QuickDB<User>();
const user: User | null = await db.get('user:1');
```
