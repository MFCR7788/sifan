import { NextRequest } from 'next/server';
import { db } from '@/storage/database';
import { knowledgeBase } from '@/storage/database/shared/schema';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 知识库检索：根据用户问题查找相关知识
async function searchKnowledgeBase(query: string): Promise<any[]> {
	// 提取关键词（简单实现：拆分中文和英文）
	const keywords = query.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];

	// 构建查询条件
	const conditions = [eq(knowledgeBase.isActive, true)];

	// 如果有关键词，进行关键词匹配
	if (keywords.length > 0) {
		const searchPatterns = keywords.map(kw => `%${kw}%`);
		const searchConditions = searchPatterns.map(pattern =>
			or(
				like(knowledgeBase.question, pattern),
				like(knowledgeBase.answer, pattern),
				sql`${knowledgeBase.keywords} ILIKE ${pattern}`
			) || sql`true`
		);
		const searchCondition = or(...searchConditions) || sql`true`;
		conditions.push(searchCondition);
	}

	// 执行查询
	const results = await db
		.select()
		.from(knowledgeBase)
		.where(and(...conditions))
		.orderBy(desc(knowledgeBase.priority))
		.limit(5);

	// 更新查看次数
	for (const item of results) {
		await db
			.update(knowledgeBase)
			.set({
				viewCount: sql`${knowledgeBase.viewCount} + 1`,
			})
			.where(eq(knowledgeBase.id, item.id));
	}

	return results;
}

// POST - 智能客服聊天接口（流式输出）
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { message, conversationHistory = [] } = body;

		if (!message) {
			return new Response(JSON.stringify({ error: '消息不能为空' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// 检索知识库
		const knowledgeResults = await searchKnowledgeBase(message);

		// 构建系统提示词
		let systemPrompt = `你是魔法超人AGI的智能客服助手，负责回答用户关于公司产品、服务、技术、价格等方面的问题。

你的回答应该：
1. 准确、专业、友好
2. 简洁明了，避免冗长
3. 如果不确定，建议用户联系人工客服
4. 回答时使用中文

`;
		// 如果知识库有相关内容，添加到提示词中
		if (knowledgeResults.length > 0) {
			systemPrompt += `\n以下是知识库中的相关信息，你可以参考：\n\n`;
			knowledgeResults.forEach((item, index) => {
				systemPrompt += `问题${index + 1}：${item.question}\n`;
				systemPrompt += `答案：${item.answer}\n\n`;
			});
			systemPrompt += `\n请根据以上知识库内容回答用户的问题。如果知识库中没有完全匹配的内容，请基于你的理解回答，但要保持准确和专业。\n`;
		} else {
			systemPrompt += `\n当前知识库中没有找到完全匹配的内容。请基于你的专业知识回答用户问题。如果无法回答，建议用户联系人工客服。\n`;
		}

		// 构建消息列表
		const messages: any[] = [
			{ role: 'system', content: systemPrompt },
		];

		// 添加历史对话
		if (conversationHistory.length > 0) {
			messages.push(...conversationHistory);
		}

		// 添加当前用户消息
		messages.push({ role: 'user', content: message });

		// 初始化LLM客户端
		const config = new Config();
		const client = new LLMClient(config);

		// 创建流式响应
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// 使用LLM流式输出
					const llmStream = client.stream(messages, {
						model: 'doubao-seed-1-6-251015',
						temperature: 0.7,
					});

					for await (const chunk of llmStream) {
						if (chunk.content) {
							const text = chunk.content.toString();
							controller.enqueue(encoder.encode(text));
						}
					}

					controller.close();
				} catch (error: any) {
					console.error('LLM stream error:', error);
					controller.enqueue(encoder.encode('\n\n抱歉，服务暂时不可用，请稍后再试。'));
					controller.close();
				}
			},
		});

		// 返回SSE流
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				'Transfer-Encoding': 'chunked',
			},
		});
	} catch (error: any) {
		console.error('Chat API error:', error);
		return new Response(JSON.stringify({ error: error.message || '聊天服务异常' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
