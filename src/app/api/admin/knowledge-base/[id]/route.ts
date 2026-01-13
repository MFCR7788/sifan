import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { knowledgeBase } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// GET - 获取单个知识库条目
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json(
				{ success: false, error: '无管理员权限' },
				{ status: 403 }
			);
		}

		const { id } = await params;
		const db = await getDb();
		const [item] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, id));

		if (!item) {
			return NextResponse.json(
				{ success: false, error: '知识库条目不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			item,
		});
	} catch (error: any) {
		console.error('Failed to fetch knowledge base item:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取知识库条目失败' },
			{ status: 500 }
		);
	}
}

// PUT - 更新知识库条目
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json(
				{ success: false, error: '无管理员权限' },
				{ status: 403 }
			);
		}

		const { id } = await params;
		const body = await request.json();
		const { category, question, answer, keywords, priority, isActive } = body;

		// 验证必填字段
		if (!category || !question || !answer) {
			return NextResponse.json(
				{ success: false, error: '分类、问题和答案不能为空' },
				{ status: 400 }
			);
		}

		const db = await getDb();

		// 更新知识库条目
		const [updatedItem] = await db
			.update(knowledgeBase)
			.set({
				category,
				question,
				answer,
				keywords: keywords || '',
				priority: priority || 0,
				isActive: isActive !== undefined ? isActive : true,
				updatedAt: new Date().toISOString(),
			})
			.where(eq(knowledgeBase.id, id))
			.returning();

		if (!updatedItem) {
			return NextResponse.json(
				{ success: false, error: '知识库条目不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			item: updatedItem,
		});
	} catch (error: any) {
		console.error('Failed to update knowledge base item:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '更新知识库条目失败' },
			{ status: 500 }
		);
	}
}

// DELETE - 删除知识库条目
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json(
				{ success: false, error: '无管理员权限' },
				{ status: 403 }
			);
		}

		const { id } = await params;
		const db = await getDb();

		// 删除知识库条目
		const [deletedItem] = await db
			.delete(knowledgeBase)
			.where(eq(knowledgeBase.id, id))
			.returning();

		if (!deletedItem) {
			return NextResponse.json(
				{ success: false, error: '知识库条目不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			item: deletedItem,
		});
	} catch (error: any) {
		console.error('Failed to delete knowledge base item:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '删除知识库条目失败' },
			{ status: 500 }
		);
	}
}
