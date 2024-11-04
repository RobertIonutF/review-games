import { integer, pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const gamesTable = pgTable("games", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
});

export const thoughtsTable = pgTable("thoughts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  gameId: integer().references(() => gamesTable.id).notNull(),
  content: text().notNull(),
  timestamp: timestamp().notNull().defaultNow(),
  mood: varchar({ length: 20 }).notNull(), // 'Happy' | 'Dissatisfied' | 'Neutral'
});
