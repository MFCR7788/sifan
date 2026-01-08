import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database/memberManager';

export async function GET(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		const member = await memberManager.getMemberByUserId(userId);
		if (!member) {
			return NextResponse.json(
				{ error: '会员信息不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ member });
	} catch (error: any) {
		console.error('Get member error:', error);

		// 如果是数据库连接错误，返回 401 而不是 500
		if (error.message?.includes('Database') || error.message?.includes('PGDATABASE')) {
			return NextResponse.json(
				{ error: '数据库未配置' },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ error: '获取会员信息失败' },
			{ status: 500 }
		);
	}
}
