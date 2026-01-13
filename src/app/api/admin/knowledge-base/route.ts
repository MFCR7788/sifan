import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { knowledgeBase } from '@/storage/database/shared/schema';
import { desc, eq, like, or, sql } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// GET - 获取知识库列表
export async function GET(request: NextRequest) {
	try {
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json(
				{ success: false, error: '无管理员权限' },
				{ status: 403 }
			);
		}

		const { searchParams } = new URL(request.url);
		const category = searchParams.get('category');
		const search = searchParams.get('search');

		let result;

		// 根据条件执行不同查询
		if (search && category && category !== 'all') {
			const searchPattern = `%${search}%`;
			result = await db
				.select({
					id: knowledgeBase.id,
					category: knowledgeBase.category,
					question: knowledgeBase.question,
					answer: knowledgeBase.answer,
					keywords: knowledgeBase.keywords,
					priority: knowledgeBase.priority,
					isActive: knowledgeBase.isActive,
					viewCount: knowledgeBase.viewCount,
					createdAt: knowledgeBase.createdAt,
					updatedAt: knowledgeBase.updatedAt,
					createdBy: knowledgeBase.createdBy,
				})
				.from(knowledgeBase)
				.where(
					sql`${knowledgeBase.category} = ${category} AND (${knowledgeBase.question} ILIKE ${searchPattern} OR ${knowledgeBase.answer} ILIKE ${searchPattern} OR ${knowledgeBase.keywords} ILIKE ${searchPattern})`
				)
				.orderBy(desc(knowledgeBase.priority), desc(knowledgeBase.createdAt));
		} else if (search) {
			const searchPattern = `%${search}%`;
			result = await db
				.select({
					id: knowledgeBase.id,
					category: knowledgeBase.category,
					question: knowledgeBase.question,
					answer: knowledgeBase.answer,
					keywords: knowledgeBase.keywords,
					priority: knowledgeBase.priority,
					isActive: knowledgeBase.isActive,
					viewCount: knowledgeBase.viewCount,
					createdAt: knowledgeBase.createdAt,
					updatedAt: knowledgeBase.updatedAt,
					createdBy: knowledgeBase.createdBy,
				})
				.from(knowledgeBase)
				.where(
					sql`${knowledgeBase.question} ILIKE ${searchPattern} OR ${knowledgeBase.answer} ILIKE ${searchPattern} OR ${knowledgeBase.keywords} ILIKE ${searchPattern}`
				)
				.orderBy(desc(knowledgeBase.priority), desc(knowledgeBase.createdAt));
		} else if (category && category !== 'all') {
			result = await db
				.select({
					id: knowledgeBase.id,
					category: knowledgeBase.category,
					question: knowledgeBase.question,
					answer: knowledgeBase.answer,
					keywords: knowledgeBase.keywords,
					priority: knowledgeBase.priority,
					isActive: knowledgeBase.isActive,
					viewCount: knowledgeBase.viewCount,
					createdAt: knowledgeBase.createdAt,
					updatedAt: knowledgeBase.updatedAt,
					createdBy: knowledgeBase.createdBy,
				})
				.from(knowledgeBase)
				.where(eq(knowledgeBase.category, category))
				.orderBy(desc(knowledgeBase.priority), desc(knowledgeBase.createdAt));
		} else {
			result = await db
				.select({
					id: knowledgeBase.id,
					category: knowledgeBase.category,
					question: knowledgeBase.question,
					answer: knowledgeBase.answer,
					keywords: knowledgeBase.keywords,
					priority: knowledgeBase.priority,
					isActive: knowledgeBase.isActive,
					viewCount: knowledgeBase.viewCount,
					createdAt: knowledgeBase.createdAt,
					updatedAt: knowledgeBase.updatedAt,
					createdBy: knowledgeBase.createdBy,
				})
				.from(knowledgeBase)
				.orderBy(desc(knowledgeBase.priority), desc(knowledgeBase.createdAt));
		}

		return NextResponse.json({
			success: true,
			items: result,
		});
	} catch (error: any) {
		console.error('Failed to fetch knowledge base:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取知识库列表失败' },
			{ status: 500 }
		);
	}
}

// POST - 新增知识库条目
export async function POST(request: NextRequest) {
	try {
		console.log('[KnowledgeBase POST] Starting request...');

		const adminUser = await verifyAdmin(request);
		console.log('[KnowledgeBase POST] Admin user:', adminUser);

		if (!adminUser) {
			console.log('[KnowledgeBase POST] No admin user found');
			return NextResponse.json(
				{ success: false, error: '无管理员权限，请确保您已登录且具有管理员权限' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		console.log('[KnowledgeBase POST] Request body:', body);

		const { category, question, answer, keywords, priority, isActive } = body;

		// 验证必填字段
		if (!category || !question || !answer) {
			console.log('[KnowledgeBase POST] Validation failed - missing required fields');
			return NextResponse.json(
				{ success: false, error: '分类、问题和答案不能为空' },
				{ status: 400 }
			);
		}

		console.log('[KnowledgeBase POST] Inserting new item...');
		// 创建知识库条目
		const [newItem] = await db
			.insert(knowledgeBase)
			.values({
				category,
				question,
				answer,
				keywords: keywords || '',
				priority: priority || 0,
				isActive: isActive !== undefined ? isActive : true,
				createdBy: adminUser.id,
			})
			.returning();

		console.log('[KnowledgeBase POST] Item created successfully:', newItem);

		return NextResponse.json({
			success: true,
			item: newItem,
		});
	} catch (error: any) {
		console.error('[KnowledgeBase POST] Failed to create knowledge base item:', error);
		console.error('[KnowledgeBase POST] Error stack:', error.stack);
		return NextResponse.json(
			{ success: false, error: error.message || '创建知识库条目失败' },
			{ status: 500 }
		);
	}
}
