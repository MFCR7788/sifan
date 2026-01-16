import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { verifyAdmin } from '@/lib/admin-auth';
import { db } from '@/storage/database';
import { knowledgeBase } from '@/storage/database/shared/schema';
import mammoth from 'mammoth';

// pdf-parse 需要动态导入
async function parsePDF(buffer: Buffer) {
	// @ts-expect-error - pdf-parse 的类型定义有问题
	const pdfParse = (await import('pdf-parse')).default;
	return pdfParse(buffer);
}

// 文件类型到分类的映射
const FILE_TYPE_TO_CATEGORY: Record<string, string> = {
	'application/pdf': '文档',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '文档',
	'text/plain': '其他',
};

export async function POST(request: NextRequest) {
	try {
		// 验证管理员权限
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json({ error: '无权限访问' }, { status: 401 });
		}

		const body = await request.json();
		const { fileKey, fileName, fileType, category } = body;

		if (!fileKey) {
			return NextResponse.json({ error: '缺少文件key' }, { status: 400 });
		}

		// 初始化对象存储
		const storage = new S3Storage({
			endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
			accessKey: '',
			secretKey: '',
			bucketName: process.env.COZE_BUCKET_NAME,
			region: 'cn-beijing',
		});

		// 从对象存储读取文件
		const fileBuffer = await storage.readFile({ fileKey });

		// 解析文件内容
		let fileContent = '';

		if (fileType === 'application/pdf') {
			// 解析 PDF
			const pdfData = await parsePDF(fileBuffer);
			fileContent = pdfData.text;
		} else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
			// 解析 DOCX
			const result = await mammoth.extractRawText({ buffer: fileBuffer });
			fileContent = result.value;
		} else if (fileType === 'text/plain') {
			// TXT 文件
			fileContent = fileBuffer.toString('utf-8');
		} else {
			return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
		}

		// 清理文件内容（去除多余空白）
		fileContent = fileContent.replace(/\s+/g, ' ').trim();

		if (!fileContent || fileContent.length < 100) {
			return NextResponse.json(
				{ error: '文件内容太少，无法生成有效问答' },
				{ status: 400 }
			);
		}

		// 使用 LLM 生成问答对
		const llmConfig = new Config({
			baseUrl: 'https://api.coze.cn', // 指定使用国内 API 端点
			modelBaseUrl: 'https://api.coze.cn/v3', // 模型 API 端点
		});
		const llmClient = new LLMClient(llmConfig);

		const systemPrompt = `你是一个专业的知识库问答生成助手。请根据提供的文档内容，生成 5-10 个高质量的问答对。

要求：
1. 问题要清晰、具体，涵盖文档的核心内容
2. 答案要准确、完整，基于文档内容
3. 生成JSON格式的输出，格式如下：
[
  {
    "question": "问题文本",
    "answer": "答案文本",
    "keywords": "关键词1,关键词2,关键词3",
    "priority": 10
  }
]
4. priority 的值根据问题的重要性设置，范围为 1-20
5. 只输出JSON数组，不要包含其他内容`;

		const messages = [
			{ role: 'system' as const, content: systemPrompt },
			{ role: 'user' as const, content: `文档名称：${fileName}\n\n文档内容：\n${fileContent}` },
		];

		// 使用 LLM 生成问答
		const response = await llmClient.invoke(messages, {
			model: 'doubao-seed-1-6-251015',
			temperature: 0.7,
		});

		// 解析 LLM 返回的 JSON
		let qaPairs;
		try {
			// 尝试提取 JSON 数组
			const jsonMatch = response.content.match(/\[[\s\S]*\]/);
			if (!jsonMatch) {
				throw new Error('未找到有效的JSON数组');
			}
			qaPairs = JSON.parse(jsonMatch[0]);
		} catch {
			console.error('Failed to parse LLM response:', response.content);
			return NextResponse.json(
				{ error: 'LLM 返回格式错误，请重试' },
				{ status: 500 }
			);
		}

		if (!Array.isArray(qaPairs) || qaPairs.length === 0) {
			return NextResponse.json(
				{ error: '未生成有效的问答对' },
				{ status: 500 }
			);
		}

		// 将问答对保存到知识库
		const insertedItems = [];
		for (const qa of qaPairs) {
			if (!qa.question || !qa.answer) {
				continue;
			}

			const result = await db.insert(knowledgeBase).values({
				category: category || FILE_TYPE_TO_CATEGORY[fileType] || '其他',
				question: qa.question,
				answer: qa.answer,
				keywords: qa.keywords || '',
				priority: qa.priority || 0,
				isActive: true,
				viewCount: 0,
				createdBy: adminUser.id,
			}).returning();

			insertedItems.push(result[0]);
		}

		return NextResponse.json({
			success: true,
			data: {
				total: insertedItems.length,
				items: insertedItems,
			},
		});
	} catch (error) {
		console.error('Parse failed:', error);
		return NextResponse.json(
			{ error: '文档解析失败' },
			{ status: 500 }
		);
	}
}
