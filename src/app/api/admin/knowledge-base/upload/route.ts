import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';
import { verifyAdmin } from '@/lib/admin-auth';

// 支持的文件类型
const ALLOWED_FILE_TYPES = [
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'text/plain',
];

// 文件大小限制：10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
	try {
		// 验证管理员权限
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json({ error: '无权限访问' }, { status: 401 });
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json({ error: '请选择文件' }, { status: 400 });
		}

		// 验证文件类型
		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			return NextResponse.json(
				{ error: '不支持的文件类型，仅支持 PDF、DOCX、TXT 格式' },
				{ status: 400 }
			);
		}

		// 验证文件大小
		if (file.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: '文件大小不能超过 10MB' },
				{ status: 400 }
			);
		}

		// 读取文件内容
		const fileBuffer = Buffer.from(await file.arrayBuffer());

		// 初始化对象存储
		const storage = new S3Storage({
			endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
			accessKey: '',
			secretKey: '',
			bucketName: process.env.COZE_BUCKET_NAME,
			region: 'cn-beijing',
		});

		// 上传文件到对象存储
		const fileName = `knowledge-base/${Date.now()}_${file.name}`;
		const fileKey = await storage.uploadFile({
			fileContent: fileBuffer,
			fileName: fileName,
			contentType: file.type,
		});

		return NextResponse.json({
			success: true,
			data: {
				fileKey: fileKey,
				fileName: file.name,
				fileSize: file.size,
				fileType: file.type,
			},
		});
	} catch (error) {
		console.error('Upload failed:', error);
		return NextResponse.json(
			{ error: '文件上传失败' },
			{ status: 500 }
		);
	}
}
