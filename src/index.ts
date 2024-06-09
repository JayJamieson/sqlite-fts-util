import Handlebars, { type HelperOptions } from "handlebars";

export type FTSConfig = {
  table: string;

  /**
   * INTEGER column used for FTS rowid value. Defaults to id
   */
  idColumn?: string;
  columns: string[];
};

/**
 * Astro DB like shape to help with type safety
 */
type AstroDbPartial = {
  tables: Record<string, { columns: Record<string, unknown> }>;
};

type AstroTablePartial = AstroDbPartial["tables"];

const virtualTable = `CREATE VIRTUAL TABLE {{table}}_fts USING fts5(
  {{#each columns}}
  {{this}},
  {{/each}}
  content='{{table}}',
  content_rowid='{{idColumn}}'
);
`;

const triggers = `/*--*/
CREATE TRIGGER {{table}}_ai AFTER INSERT ON {{table}}
BEGIN
  INSERT INTO {{table}}_fts (rowid, {{#commaSeparated columns}}{{this}}{{/commaSeparated}})
  VALUES (new.{{idColumn}}, {{#commaSeparated columns}}new.{{this}}{{/commaSeparated}});
END;
/*--*/
CREATE TRIGGER {{table}}_ad AFTER DELETE ON {{table}}
BEGIN
  INSERT INTO {{table}}_fts ({{table}}_fts, rowid, {{#commaSeparated columns}}{{this}}{{/commaSeparated}})
  VALUES ('delete', old.{{idColumn}}, {{#commaSeparated columns}}old.{{this}}{{/commaSeparated}});
END;
/*--*/
CREATE TRIGGER {{table}}_au AFTER UPDATE ON {{table}}
BEGIN
  INSERT INTO {{table}}_fts ({{table}}_fts, rowid, {{#commaSeparated columns}}{{this}}{{/commaSeparated}})
  VALUES ('delete', old.{{idColumn}}, {{#commaSeparated columns}}old.{{this}}{{/commaSeparated}});

  INSERT INTO {{table}}_fts (rowid, {{#commaSeparated columns}}{{this}}{{/commaSeparated}})
  VALUES (new.{{idColumn}}, {{#commaSeparated columns}}new.{{this}}{{/commaSeparated}});
END;`;

const commaSeparatedHelper = (items: string[], options: HelperOptions) => {
  if (!items || items.length === 0) {
    return "";
  }

  let result = "";
  for (let i = 0; i < items.length; i++) {
    result += options.fn(items[i]);
    if (i < items.length - 1) {
      result += ", ";
    }
  }
  return result;
};

export default function fts5Table(config: FTSConfig): () => string {
  if (!config) {
    throw new Error("Missing config");
  }

  const table = config.table || "";
  const columns = config.columns || [];
  const idColumn = config.idColumn || "id";
  config.idColumn = idColumn;

  if (table.length === 0 || columns.length === 0) {
    throw new Error("Table or columns are empty, please provide them");
  }

  Handlebars.registerHelper("commaSeparated", commaSeparatedHelper);
  const template = Handlebars.compile(virtualTable + triggers);

  return () => {
    return template(config);
  };
}

export function fts5TableFromAstroDb<
  C extends keyof AstroTablePartial[T]["columns"],
  T extends keyof AstroTablePartial,
  D extends AstroDbPartial,
>(_db: D, config: { table: T; idColumn?: string; columns: C[] }) {
  return fts5Table({
    columns: config.columns as string[],
    table: config.table as string,
    idColumn: config.idColumn,
  });
}
