import { eq, sql } from 'drizzle-orm';
import { getDb } from 'coze-coding-dev-sdk';
import { orders, type InsertOrder, type Order } from './shared/schema';

export class OrderManager {
	/**
	 * 创建订单
	 */
	async createOrder(data: InsertOrder & { orderNumber: string }): Promise<Order> {
		const db = await getDb();

		// 使用原生SQL插入，避免Drizzle ORM处理JSONB字段的问题
		const query = sql`
			INSERT INTO orders (
				order_number, customer_name, customer_phone, customer_email, 
				platform, service_level, selected_features, value_services, 
				total_price, monthly_fee, status, notes
			) VALUES (
				${data.orderNumber},
				${data.customerName},
				${data.customerPhone},
				${data.customerEmail},
				${data.platform},
				${data.serviceLevel || null},
				${JSON.stringify(data.selectedFeatures || [])}::jsonb,
				${data.valueServices && data.valueServices.length > 0 ? JSON.stringify(data.valueServices) : null}::jsonb,
				${data.totalPrice},
				${data.monthlyFee || 0},
				'pending',
				${data.notes || null}
			) RETURNING *
		`;

		const result = await db.execute(query);
		const order = result.rows[0];

		return order as Order;
	}

	/**
	 * 根据订单号获取订单
	 */
	async getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
		const db = await getDb();

		const query = sql`
			SELECT * FROM orders
			WHERE order_number = ${orderNumber}
		`;

		const result = await db.execute(query);

		if (result.rows.length === 0) {
			return null;
		}

		return result.rows[0] as Order;
	}

	/**
	 * 根据ID获取订单
	 */
	async getOrderById(id: string): Promise<Order | null> {
		const db = await getDb();

		const query = sql`
			SELECT * FROM orders
			WHERE id = ${id}
		`;

		const result = await db.execute(query);

		if (result.rows.length === 0) {
			return null;
		}

		return result.rows[0] as Order;
	}

	/**
	 * 更新订单支付状态
	 */
	async updateOrderPaymentStatus(orderNumber: string, status: 'paid' | 'cancelled', paymentMethod?: string): Promise<Order | null> {
		const db = await getDb();

		const query = sql`
			UPDATE orders
			SET status = ${status},
				payment_method = ${paymentMethod || null},
				payment_time = ${status === 'paid' ? new Date().toISOString() : null},
				updated_at = ${new Date().toISOString()}
			WHERE order_number = ${orderNumber}
			RETURNING *
		`;

		const result = await db.execute(query);

		if (result.rows.length === 0) {
			return null;
		}

		return result.rows[0] as Order;
	}

	/**
	 * 获取订单列表（分页）
	 */
	async getOrderList(limit: number = 10, offset: number = 0, status?: string): Promise<Order[]> {
		const db = await getDb();

		let query: any;

		if (status) {
			query = sql`
				SELECT * FROM orders
				WHERE status = ${status}
				ORDER BY created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`;
		} else {
			query = sql`
				SELECT * FROM orders
				ORDER BY created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`;
		}

		const result = await db.execute(query);
		return result.rows as Order[];
	}

	/**
	 * 生成订单号
	 */
	generateOrderNumber(): string {
		const timestamp = Date.now().toString();
		const random = Math.random().toString(36).substring(2, 8).toUpperCase();
		return `ORD${timestamp}${random}`;
	}
}

export const orderManager = new OrderManager();
