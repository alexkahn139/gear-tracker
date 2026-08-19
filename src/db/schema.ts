import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const gearItems = sqliteTable('gear_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  photoUrl: text('photo_url'),
  weightG: integer('weight_g'),
  qtyOwned: integer('qty_owned').notNull().default(1),
  condition: text('condition').notNull().default('good'),
  location: text('location'),
  serialId: text('serial_id'),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const gearLoans = sqliteTable('gear_loans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  gearItemId: integer('gear_item_id')
    .notNull()
    .references(() => gearItems.id),
  borrowerId: integer('borrower_id')
    .notNull()
    .references(() => users.id),
  checkedOutAt: text('checked_out_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  dueDate: text('due_date'),
  returnedAt: text('returned_at'),
  conditionOnReturn: text('condition_on_return'),
  notes: text('notes'),
});

export const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  startDate: text('start_date'),
  endDate: text('end_date'),
  location: text('location'),
  notes: text('notes'),
  shareToken: text('share_token').unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const packListItems = sqliteTable('pack_list_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  gearItemId: integer('gear_item_id').references(() => gearItems.id),
  adHocName: text('ad_hoc_name'),
  qtyNeeded: integer('qty_needed').notNull().default(1),
  qtyChecked: integer('qty_checked').notNull().default(0),
  notes: text('notes'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export type UserRow = typeof users.$inferSelect;
export type GearItemRow = typeof gearItems.$inferSelect;
export type GearLoanRow = typeof gearLoans.$inferSelect;
export type TripRow = typeof trips.$inferSelect;
export type PackListItemRow = typeof packListItems.$inferSelect;
