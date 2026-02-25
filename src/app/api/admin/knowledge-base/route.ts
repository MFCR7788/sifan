import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

// 模拟知识库数据
const mockKnowledgeBase = [
	{
		id: '1',
		category: '产品',
		question: '如何使用产品？',
		answer: '您可以按照以下步骤使用我们的产品：1. 注册账号 2. 登录系统 3. 选择需要的功能 4. 按照提示操作',
		keywords: '使用 操作 步骤',
		priority: 5,
		isActive: true,
		viewCount: 100,
		createdAt: '2024-01-01T00:00:00.000Z',
		updatedAt: '2024-01-01T00:00:00.000Z',
		createdBy: 'admin-1',
	},
	{
		id: '2',
		category: '技术',
		question: '如何解决技术问题？',
		answer: '如果您遇到技术问题，可以尝试以下方法：1. 查看帮助文档 2. 联系技术支持 3. 重启系统',
		keywords: '技术 问题 解决',
		priority: 4,
		isActive: true,
		viewCount: 80,
		createdAt: '2024-01-02T00:00:00.000Z',
		updatedAt: '2024-01-02T00:00:00.000Z',
		createdBy: 'admin-1',
	},
	{
		id: '3',
		category: '服务',
		question: '如何联系客服？',
		answer: '您可以通过以下方式联系客服：1. 电话：400-123-4567 2. 邮箱：support@example.com 3. 在线聊天',
		keywords: '客服 联系 支持',
		priority: 3,
		isActive: true,
		viewCount: 60,
		createdAt: '2024-01-03T00:00:00.000Z',
		updatedAt: '2024-01-03T00:00:00.000Z',
		createdBy: 'admin-1',
	},
];

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

		// 模拟查询逻辑
		let result = [...mockKnowledgeBase];

		// 按分类筛选
		if (category && category !== 'all') {
			result = result.filter(item => item.category === category);
		}

		// 按搜索词筛选
		if (search) {
			const searchLower = search.toLowerCase();
			result = result.filter(item => 
				item.question.toLowerCase().includes(searchLower) ||
				item.answer.toLowerCase().includes(searchLower) ||
				item.keywords.toLowerCase().includes(searchLower)
			);
		}

		// 按优先级和创建时间排序
		result.sort((a, b) => {
			if (b.priority !== a.priority) {
				return b.priority - a.priority;
			}
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		return NextResponse.json({
			success: true,
			items: result,
		});
	} catch (error: unknown) {
		console.error('Failed to fetch knowledge base:', error);
		const errorMessage = error instanceof Error ? error.message : '获取知识库列表失败';
		return NextResponse.json(
			{ success: false, error: errorMessage },
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

		// 模拟创建新条目
		const newItem = {
			id: (mockKnowledgeBase.length + 1).toString(),
			category,
			question,
			answer,
			keywords: keywords || '',
			priority: priority || 0,
			isActive: isActive !== undefined ? isActive : true,
			viewCount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			createdBy: adminUser.id,
		};

		// 添加到模拟数据中
		mockKnowledgeBase.push(newItem);

		console.log('[KnowledgeBase POST] Item created successfully:', newItem);

		return NextResponse.json({
			success: true,
			item: newItem,
		});
	} catch (error: unknown) {
		console.error('[KnowledgeBase POST] Failed to create knowledge base item:', error);
		const errorMessage = error instanceof Error ? error.message : '创建知识库条目失败';
		if (error instanceof Error) {
			console.error('[KnowledgeBase POST] Error stack:', error.stack);
		}
		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
