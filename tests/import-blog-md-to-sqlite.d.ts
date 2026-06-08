declare module '../scripts/import-blog-md-to-sqlite.mjs' {
  export function importBlogDraftsIntoSqlite(options?: {
    dbPath?: string;
    sourceConfigs?: Array<{
      dir: string;
      category: string;
      heroImage: string;
      series: string;
      tags: string[];
    }>;
  }): {
    dbPath: string;
    importedCount: number;
    sourceCount: number;
  };
}
