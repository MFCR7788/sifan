import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database/memberManager';

export async function GET(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;
		console.log('Transactions API: Cookie中的userId:', userId);

		if (!userId) {
			console.log('Transactions API: userId不存在，返回401');
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		// 获取查询参数
		const searchParams = request.nextUrl.searchParams;
		const type = searchParams.get('type'); // recharge, consumption, 或 recharge_types
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');

		console.log('Transactions API: 查询参数', {
			type,
			page,
			limit
		});

		// 获取会员信息
		const member = await memberManager.getMemberByUserId(userId);

		if (!member) {
			console.log('Transactions API: 会员不存在');
			return NextResponse.json(
				{ error: '会员不存在' },
				{ status: 404 }
			);
		}

		console.log('Transactions API: 查询会员ID:', member.id);

		// 根据类型确定要查询的交易类型
		let transactionTypes: string[] | undefined;
		if (type === 'recharge') {
			// 充值记录：包含余额充值、积分充值、购买会员
			transactionTypes = ['recharge', 'points_recharge', 'membership_purchase'];
		} else if (type === 'consumption') {
			// 消费记录
			transactionTypes = ['consumption', 'membership_consumption', 'points_consumption'];
		} else if (type === 'recharge_types') {
			// 所有充值相关的类型
			transactionTypes = ['recharge', 'points_recharge', 'membership_purchase'];
		}

		// 获取交易记录
		const skip = (page - 1) * limit;
		const transactions = await memberManager.getTransactions(member.id, {
			skip,
			limit,
			filters: transactionTypes ? { transactionType: transactionTypes } : undefined,
		});

		// 获取总数
		const allTransactions = await memberManager.getTransactions(member.id, {
			skip: 0,
			limit: 10000,
			filters: transactionTypes ? { transactionType: transactionTypes } : undefined,
		});
		const total = allTransactions.length;

		console.log('Transactions API: 返回交易记录数量:', transactions.length);

		return NextResponse.json({
			transactions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			}
		});
	} catch (error: any) {
		console.error('Get transactions error:', error);

		// 如果是数据库连接错误，返回 401
		if (error.message?.includes('Database') || error.message?.includes('PGDATABASE')) {
			return NextResponse.json(
				{ error: '数据库未配置' },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ error: '获取交易记录失败' },
			{ status: 500 }
		);
	}
}
