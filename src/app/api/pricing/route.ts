import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import axios from 'axios';

const EXCEL_URL = 'https://coze-coding-project.tos.coze.site/create_attachment/2026-01-04/1954252937505416_796a009338869e96ffc022cb86803d12_%E9%AD%94%E6%B3%95%E8%B6%85%E4%BA%BA3.0%E7%B3%BB%E7%BB%9F%E6%8A%A5%E4%BB%B7_%E4%BA%A7%E5%93%81%E6%8A%A5%E4%BB%B7%E8%A1%A8_%E8%A1%A8%E6%A0%BC.xlsx?sign=4889528705-b5eaee72d2-0-071cf9d7efec1a1fd75b6eb59a7879a6b3ee705c648256bd958bc3cc159b7c54';

export async function GET() {
  try {
    // 下载Excel文件
    const response = await axios.get(EXCEL_URL, { responseType: 'arraybuffer' });
    const arrayBuffer = response.data;

    // 解析Excel
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // 解析数据
    const pricingData = parsePricingData(data);

    return NextResponse.json({
      success: true,
      data: pricingData
    });
  } catch (error) {
    console.error('Error parsing Excel:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse pricing data' },
      { status: 500 }
    );
  }
}

function parsePricingData(data: any[][]) {
  // 假设第一行是表头，从第二行开始是数据
  if (data.length < 2) return [];

  const headers = data[0];
  const result = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowObj: any = {};

    headers.forEach((header: any, index: number) => {
      rowObj[header] = row[index];
    });

    result.push(rowObj);
  }

  return result;
}
