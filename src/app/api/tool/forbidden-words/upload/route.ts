import { NextRequest, NextResponse } from 'next/server';

// 违禁词库
const forbiddenWordsLibrary = {
  '公众号': {
    '与"最"有关': ['最', '最佳', '最具', '最爱', '最赚', '最优', '最优秀', '最低', '最高', '最便宜', '最多', '最先进', '最后'],
    '与"一"有关': ['第一', '中国第一', '全网第一', '销量第一', '排名第一', '之一', '首选', '独家', '独家首发', '全国第一'],
    '与"级/极"有关': ['国家级', '世界级', '最高级', '顶级', '极品', '极致', '终极', '超级', '超值', '极佳'],
    '与"首/家/国"有关': ['首个', '首款', '首家', '独家', '独家首发', '全国首发', '全球首发', '国家领导人推荐'],
    '与"品牌/质量"有关': ['销量冠军', '领袖品牌', '世界领先', '行业领先', '领先', '领导品牌', '品牌价值第一', '销量领先'],
    '与"承诺/保证"有关': ['承诺', '保证', '包过', '包退', '包换', '包满意', '保证有效', '保证无副作用', '无效退款'],
    '与"时间相关"有关': ['永久', '终身', '100年', '史无前例', '前无古人', '从未有过', '空前绝后', '绝无仅有'],
    '与"认证/奖项"有关': ['国家认证', '国际认证', '获得XX奖', 'XX品牌推荐', 'XX协会认证', 'ISO认证', '质量免检'],
  },
  '小红书': {
    '与"最"有关': ['最', '最佳', '最具', '最爱', '最赚', '最优', '最优秀', '最低', '最高', '最便宜', '最多', '最先进'],
    '与"一"有关': ['第一', '中国第一', '全网第一', '销量第一', '排名第一', '之一', '首选', '独家', '独家首发'],
    '与"级/极"有关': ['国家级', '世界级', '最高级', '顶级', '极品', '极致', '终极', '超级', '超值', '极佳'],
    '与"承诺/保证"有关': ['承诺', '保证', '包过', '包退', '包换', '包满意', '保证有效', '保证无副作用'],
    '与"夸大宣传"有关': ['绝对', '完全', '100%', '百分百', '百分之一百', '彻底', '完全不含', '永不', '永久'],
  },
  '抖音': {
    '与"最"有关': ['最', '最佳', '最具', '最爱', '最赚', '最优', '最优秀', '最低', '最高', '最便宜', '最多'],
    '与"一"有关': ['第一', '中国第一', '全网第一', '销量第一', '排名第一', '之一', '首选', '独家', '独家首发'],
    '与"级/极"有关': ['国家级', '世界级', '最高级', '顶级', '极品', '极致', '终极', '超级', '超值'],
    '与"承诺/保证"有关': ['承诺', '保证', '包过', '包退', '包换', '包满意', '保证有效', '保证无副作用'],
    '与"引流违规"有关': ['加微信', '加群', '私信', '私信我', '关注我', '粉丝群', '点击主页', '看我主页', '私信领取'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const platform = formData.get('platform') as string;

    if (!file || !platform) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const text = await file.text();

    // 获取对应平台的违禁词库
    const platformLibrary = forbiddenWordsLibrary[platform as keyof typeof forbiddenWordsLibrary] || forbiddenWordsLibrary['公众号'];

    // 查找文本中的违禁词
    const foundWords: Record<string, string[]> = {};
    const allWords = new Set<string>();

    for (const [category, words] of Object.entries(platformLibrary)) {
      const foundInCategory: string[] = [];

      for (const word of words) {
        if (text.includes(word)) {
          foundInCategory.push(word);
          allWords.add(word);
        }
      }

      if (foundInCategory.length > 0) {
        foundWords[category] = foundInCategory;
      }
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      totalFound: allWords.size,
      foundWords,
      message: `检测到 ${allWords.size} 个违禁词`,
    });
  } catch (error) {
    console.error('文档上传分析失败:', error);
    return NextResponse.json(
      { error: '分析失败' },
      { status: 500 }
    );
  }
}
