import { expect, test } from "vitest";
import fts5Table from "./index.js";

test("table and columns are required", () => {
  expect(() =>
    fts5Table({ table: "foo", idColumn: "", columns: [] }),
  ).toThrowError("Table or columns are empty, please provide them");

  expect(() =>
    fts5Table({ table: "", idColumn: "", columns: ["foo"] }),
  ).toThrowError("Table or columns are empty, please provide them");
});

test("resulting sql can be split on /*--*/", () => {
  const config = {
    table: "foo",
    idColumn: "",
    columns: ["column1", "column2"],
  };

  const generateFTS = fts5Table(config);

  const sql = generateFTS();
  const sqlSplit = sql.split("/*--*/");

  expect(sqlSplit.length).toBe(4);
});

test("fts5Table can generate successfully", () => {
  const config = {
    table: "foo",
    idColumn: "id",
    columns: ["column1", "column2"],
  };

  const generateFTS = fts5Table(config);

  const sql = generateFTS();

  const expected = `CREATE VIRTUAL TABLE foo_fts USING fts5(
  column1,
  column2,
  content='foo',
  content_rowid='id'
);
/*--*/
CREATE TRIGGER foo_ai AFTER INSERT ON foo
BEGIN
  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;
/*--*/
CREATE TRIGGER foo_ad AFTER DELETE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);
END;
/*--*/
CREATE TRIGGER foo_au AFTER UPDATE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);

  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;`;

  expect(sql).toBe(expected);
});

test("fts5Table can conditionally add prefix index setting", () => {
  const config = {
    table: "foo",
    idColumn: "id",
    columns: ["column1", "column2"],
    prefix: [2, 3],
  };

  const generateFTS = fts5Table(config);

  const sql = generateFTS();

  const expected = `CREATE VIRTUAL TABLE foo_fts USING fts5(
  column1,
  column2,
  prefix='2 3',
  content='foo',
  content_rowid='id'
);
/*--*/
CREATE TRIGGER foo_ai AFTER INSERT ON foo
BEGIN
  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;
/*--*/
CREATE TRIGGER foo_ad AFTER DELETE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);
END;
/*--*/
CREATE TRIGGER foo_au AFTER UPDATE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);

  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;`;

  expect(sql).toBe(expected);
});

test("fts5Table can conditionally add tokenize setting", () => {
  const config = {
    table: "foo",
    idColumn: "id",
    columns: ["column1", "column2"],
    tokenize: "porter ascii",
  };

  const generateFTS = fts5Table(config);

  const sql = generateFTS();

  const expected = `CREATE VIRTUAL TABLE foo_fts USING fts5(
  column1,
  column2,
  tokenize='porter ascii',
  content='foo',
  content_rowid='id'
);
/*--*/
CREATE TRIGGER foo_ai AFTER INSERT ON foo
BEGIN
  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;
/*--*/
CREATE TRIGGER foo_ad AFTER DELETE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);
END;
/*--*/
CREATE TRIGGER foo_au AFTER UPDATE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);

  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;`;

  expect(sql).toBe(expected);
});

test("fts5Table can conditionally add tokenize and prefix setting", () => {
  const config = {
    table: "foo",
    idColumn: "id",
    columns: ["column1", "column2"],
    prefix: [2, 3],
    tokenize: "porter ascii",
  };

  const generateFTS = fts5Table(config);

  const sql = generateFTS();

  const expected = `CREATE VIRTUAL TABLE foo_fts USING fts5(
  column1,
  column2,
  prefix='2 3',
  tokenize='porter ascii',
  content='foo',
  content_rowid='id'
);
/*--*/
CREATE TRIGGER foo_ai AFTER INSERT ON foo
BEGIN
  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;
/*--*/
CREATE TRIGGER foo_ad AFTER DELETE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);
END;
/*--*/
CREATE TRIGGER foo_au AFTER UPDATE ON foo
BEGIN
  INSERT INTO foo_fts (foo_fts, rowid, column1, column2)
  VALUES ('delete', old.id, old.column1, old.column2);

  INSERT INTO foo_fts (rowid, column1, column2)
  VALUES (new.id, new.column1, new.column2);
END;`;

  expect(sql).toBe(expected);
});
