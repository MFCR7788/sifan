import { NextRequest, NextResponse } from 'next/server';
import { orderManager } from '@/storage/database/orderManager';
import { insertOrderSchema } from '@/storage/database/shared/schema';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// 验证请求数据
		const validatedData = insertOrderSchema.parse(body);

		// 生成订单号
		const orderNumber = orderManager.generateOrderNumber();

		// 准备订单数据，确保JSONB字段格式正确
		const orderData: any = {
			customerName: validatedData.customerName,
			customerPhone: validatedData.customerPhone,
			customerEmail: validatedData.customerEmail,
			platform: validatedData.platform,
			selectedFeatures: validatedData.selectedFeatures || [],
			totalPrice: validatedData.totalPrice,
			monthlyFee: validatedData.monthlyFee || 0,
			orderNumber,
		};

		// 可选字段
		if (validatedData.serviceLevel) {
			orderData.serviceLevel = validatedData.serviceLevel;
		}
		if (validatedData.valueServices && validatedData.valueServices.length > 0) {
			orderData.valueServices = validatedData.valueServices;
		}
		if (validatedData.notes) {
			orderData.notes = validatedData.notes;
		}

		// 创建订单
		const order = await orderManager.createOrder(orderData);

		// 返回订单信息
		return NextResponse.json({
			success: true,
			data: {
				id: order.id,
				orderNumber: order.orderNumber,
				totalPrice: order.totalPrice,
				status: order.status,
				createdAt: order.createdAt,
			},
		});
	} catch (error: any) {
		console.error('Create order error:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || '创建订单失败',
			},
			{ status: 400 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const status = searchParams.get('status');
		const limit = parseInt(searchParams.get('limit') || '10');
		const offset = parseInt(searchParams.get('offset') || '0');

		// 获取订单列表
		const orders = await orderManager.getOrderList(limit, offset, status || undefined);

		return NextResponse.json({
			success: true,
			data: orders,
		});
	} catch (error: any) {
		console.error('Get orders error:', error);

		return NextResponse.json(
			{
				success: false,
				error: error.message || '获取订单列表失败',
			},
			{ status: 500 }
		);
	}
}
