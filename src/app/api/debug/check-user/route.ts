import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database/memberManager';
import { userManager } from '@/storage/database/userManager';

export async function GET(request: NextRequest) {
	const cookies = request.cookies;
	const userId = cookies.get('userId')?.value;

	const result = {
		cookiesPresent: !!userId,
		userId: userId || null,
		userExists: false,
		memberExists: false,
		user: null,
		member: null,
	};

	if (userId) {
		try {
			const user = await userManager.getUserById(userId);
			result.userExists = !!user;
			result.user = user ? {
				id: user.id,
				name: user.name,
				phone: user.phone,
				email: user.email,
				isAdmin: user.isAdmin,
			} : null;

			if (user) {
				const member = await memberManager.getMemberByUserId(userId);
				result.memberExists = !!member;
				result.member = member ? {
					id: member.id,
					userId: member.userId,
					memberLevel: member.memberLevel,
					balance: member.balance,
					points: member.points,
					memberStatus: member.memberStatus,
				} : null;
			}
		} catch (error: any) {
			result.error = error.message;
		}
	}

	return NextResponse.json(result);
}
