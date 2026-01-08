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

		let member = await memberManager.getMemberByUserId(userId);

		// 如果会员不存在，自动创建基础会员
		if (!member) {
			try {
				member = await memberManager.createMember({
					userId,
					memberLevel: 'basic',
					balance: 0,
					points: 0,
					totalRecharge: 0,
					totalConsumption: 0,
					memberStatus: 'active',
				});
			} catch (createError) {
				console.error('Auto-create member error:', createError);
				return NextResponse.json(
					{ error: '会员信息创建失败' },
					{ status: 500 }
				);
			}
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
