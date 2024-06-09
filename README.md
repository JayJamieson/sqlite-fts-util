# sqlite-fts-util

Easily configure and create SQLite FTS5 tables. This library is intended to be used as a utility as part of your application. There is a single function `fts5Table` that generates SQLite sql necessary for creating a FTS5 virtual table as well as triggers to keep the table up to date.

## Getting started

Assuming the following table structure:

```sql
CREATE TABLE recipes(
  id INTEGER NOT NULL PRIMARY KEY,
  title TEXT,
  directions TEXT
);
```

We can create the following configuration to create a function that will be able to generate SQL for fts5 virtual table and triggers

```js
import fts5Table from "sqlite-fts-util";

const sqlFTS = fts5Table({
  table: "recipes",
  columns: ["title", "directions"]
});

// render actual sql schema to a string
const sql = sqlFTS();
```

### Astro DB

FTS5 sql can be generated from an Astro DB definition, some slight modification to your `db/config.ts` is required to get things to work nicely.

The main changes are to assign a local `TableConfig` variable for your `defineDb` configuration object instead if passing it inline.

```ts
import { column, defineDb, defineTable } from "astro:db";

const Comment = defineTable({
  columns: {
    author: column.text(),
    body: column.text(),
  },
});

// This step is important, otherwise types for fts5TableFromAstroDb don't seem to play nicely
const TableConfig = {
  tables: { Comment },
}

export default defineDb(TableConfig);
```

We can then in a separate file use `fts5TableFromAstroDb` with type safety to configure a SQL generating method for FTS5 DDL.

```ts
import { fts5TableFromAstroDb } from "sqlite-fts-util";

const generateSql = fts5TableFromAstroDb(TableConfig, {
  table: "Comment",
  idColumn: "id",
  columns: ["author", "body"]
});
```
