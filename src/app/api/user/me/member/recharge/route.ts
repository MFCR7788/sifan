import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database/memberManager';

export async function POST(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;
		console.log('Recharge API: Cookie中的userId:', userId);

		if (!userId) {
			console.log('Recharge API: userId不存在，返回401');
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { amount, paymentMethod, description } = body;

		console.log('Recharge API: 充值参数', {
			amount,
			paymentMethod,
			description,
		});

		// 验证参数
		if (!amount || amount <= 0) {
			return NextResponse.json(
				{ error: '充值金额必须大于0' },
				{ status: 400 }
			);
		}

		if (!paymentMethod) {
			return NextResponse.json(
				{ error: '请选择支付方式' },
				{ status: 400 }
			);
		}

		// 获取会员信息
		const member = await memberManager.getMemberByUserId(userId);

		if (!member) {
			console.log('Recharge API: 会员不存在');
			return NextResponse.json(
				{ error: '会员不存在' },
				{ status: 404 }
			);
		}

		// 执行充值
		const { member: updatedMember } = await memberManager.rechargeBalance(
			userId,
			amount,
			paymentMethod,
			'', // paymentTransactionId - 实际场景中应由支付平台返回
			description || `充值 ¥${amount / 100}`,
		);

		console.log('Recharge API: 充值成功', {
			oldBalance: member.balance,
			newBalance: updatedMember.balance,
		});

		return NextResponse.json({
			message: '充值成功',
			member: updatedMember,
			transaction: {
				amount,
				balanceBefore: member.balance,
				balanceAfter: updatedMember.balance,
			},
		});
	} catch (error: unknown) {
		console.error('Recharge error:', error);

		// 如果是数据库连接错误，返回 401
		if (error.message?.includes('Database') || error.message?.includes('PGDATABASE')) {
			return NextResponse.json(
				{ error: '数据库未配置' },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ error: error instanceof Error ? error.message : '充值失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
