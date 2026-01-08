import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // 读取本地Excel文件
    const filePath = join(process.cwd(), 'assets', '新零售产品报价单.xlsx');
    const buffer = await readFile(filePath);

    // 解析Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为JSON（带表头）
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    // 更新指定功能的价格
    const updatedData = data.map((item: any) => {
      if (item['功能名称'] === '多平台抓单') {
        return { ...item, '价格/月': 800 }; // ¥9600/年 = 800/月
      }
      if (item['功能名称'] === '区域合伙人（新）') {
        return { ...item, '价格/月': 500 }; // ¥6000/年 = 500/月
      }
      if (item['功能名称'] === '门头形象') {
        return { ...item, '功能名称': '门头形象（实体店）' };
      }
      return item;
    });

    // 添加分销点功能（如果不存在）
    if (!updatedData.some((item: any) => item['功能名称'].includes('分销点'))) {
      updatedData.push({
        '功能名称': '分 销 点（包含开抖店费用，形象招牌）',
        '价格/月': 50, // ¥600/个
        '单位': '个',
        '基础版3.0系统': '√',
        '旗舰版3.0系统': '√',
        '至尊版3.0': '√'
      });
    }

    // 添加门头形象功能（如果不存在）
    if (!updatedData.some((item: any) => item['功能名称'].includes('门头'))) {
      updatedData.push({
        '功能名称': '门头形象（实体店）',
        '价格/月': 417, // ¥5000/店（按年计算约 417/月）
        '单位': '店',
        '基础版3.0系统': '√',
        '旗舰版3.0系统': '√',
        '至尊版3.0': '√'
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedData
    });
  } catch (error) {
    console.error('Error parsing Excel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse pricing data' },
      { status: 500 }
    );
  }
}
