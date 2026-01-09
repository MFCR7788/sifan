import { relations } from "drizzle-orm/relations";
import { users, members, memberTransactions } from "./schema";

export const membersRelations = relations(members, ({one, many}) => ({
	user: one(users, {
		fields: [members.userId],
		references: [users.id]
	}),
	memberTransactions: many(memberTransactions),
}));

export const usersRelations = relations(users, ({many}) => ({
	members: many(members),
}));

export const memberTransactionsRelations = relations(memberTransactions, ({one}) => ({
	member: one(members, {
		fields: [memberTransactions.memberId],
		references: [members.id]
	}),
}));