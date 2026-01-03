import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // 读取本地Excel文件
    const filePath = join(process.cwd(), 'assets', '魔法超人3.0系统报价_产品报价表_表格 (1).xlsx');
    const buffer = await readFile(filePath);

    // 解析Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为JSON（带表头）
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    return NextResponse.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error parsing Excel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse pricing data' },
      { status: 500 }
    );
  }
}
