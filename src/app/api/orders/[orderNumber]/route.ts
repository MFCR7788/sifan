import { NextRequest, NextResponse } from 'next/server';
import { orderManager } from '@/storage/database/orderManager';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ orderNumber: string }> }
) {
	try {
		const { orderNumber } = await params;

		// 获取订单信息
		const order = await orderManager.getOrderByOrderNumber(orderNumber);

		if (!order) {
			return NextResponse.json(
				{
					success: false,
					error: '订单不存在',
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: order,
		});
	} catch (error: any) {
		console.error('Get order error:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || '获取订单失败',
			},
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ orderNumber: string }> }
) {
	try {
		const { orderNumber } = await params;
		const body = await request.json();

		// 更新订单支付状态
		if (body.status && ['paid', 'cancelled'].includes(body.status)) {
			const order = await orderManager.updateOrderPaymentStatus(
				orderNumber,
				body.status,
				body.paymentMethod
			);

			if (!order) {
				return NextResponse.json(
					{
						success: false,
						error: '订单不存在',
					},
					{ status: 404 }
				);
			}

			return NextResponse.json({
				success: true,
				data: order,
			});
		}

		return NextResponse.json(
			{
				success: false,
				error: '无效的请求参数',
			},
			{ status: 400 }
		);
	} catch (error: any) {
		console.error('Update order error:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || '更新订单失败',
			},
			{ status: 500 }
		);
	}
}
