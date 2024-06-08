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
