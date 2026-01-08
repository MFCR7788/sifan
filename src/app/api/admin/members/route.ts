import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database/memberManager';
import { userManager } from '@/storage/database/userManager';

export async function GET(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		// 验证是否是管理员
		// admin用户ID是硬编码的 'admin-id'，不在数据库中
		let user;
		if (userId === 'admin-id') {
			user = {
				id: 'admin-id',
				isAdmin: true,
			};
		} else {
			user = await userManager.getUserById(userId);
		}

		if (!user || !user.isAdmin) {
			return NextResponse.json(
				{ error: '无权访问' },
				{ status: 403 }
			);
		}

		// 获取所有会员（包括用户信息）
		const members = await memberManager.getMembers();

		// 获取所有会员对应的用户信息
		const membersWithUser = await Promise.all(
			members.map(async (member) => {
				const memberUser = await userManager.getUserById(member.userId);
				return {
					...member,
					user: memberUser,
				};
			})
		);

		return NextResponse.json({ members: membersWithUser });
	} catch (error: any) {
		console.error('Get members error:', error);

		return NextResponse.json(
			{ error: '获取会员列表失败' },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		// 验证是否是管理员
		// admin用户ID是硬编码的 'admin-id'，不在数据库中
		let user;
		if (userId === 'admin-id') {
			user = {
				id: 'admin-id',
				isAdmin: true,
			};
		} else {
			user = await userManager.getUserById(userId);
		}

		if (!user || !user.isAdmin) {
			return NextResponse.json(
				{ error: '无权访问' },
				{ status: 403 }
			);
		}

		const body = await request.json();
		const { memberId, ...updateData } = body;

		if (!memberId) {
			return NextResponse.json(
				{ error: '缺少会员ID' },
				{ status: 400 }
			);
		}

		const updatedMember = await memberManager.updateMember(memberId, updateData);

		if (!updatedMember) {
			return NextResponse.json(
				{ error: '会员不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ member: updatedMember });
	} catch (error: any) {
		console.error('Update member error:', error);

		return NextResponse.json(
			{ error: '更新会员信息失败' },
			{ status: 500 }
		);
	}
}
