// 工具菜单配置
export interface ToolMenuItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: string;
  color: string;
}

export const TOOL_MENU: ToolMenuItem[] = [
  {
    id: 'ai-copywriting',
    name: 'AI文案创作',
    icon: '✍️',
    description: '多平台文案一键生成',
    path: '/tool/ai-copywriting',
    color: 'bg-blue-500',
  },
  {
    id: 'title-gen',
    name: '标题生成',
    icon: '📝',
    description: '吸引眼球的热门标题',
    path: '/tool/title-gen',
    color: 'bg-green-500',
  },
  {
    id: 'rewrite',
    name: '文案改写',
    icon: '🔄',
    description: '智能改写优化文案',
    path: '/tool/rewrite',
    color: 'bg-purple-500',
  },
  {
    id: 'short-video-caption',
    name: '短视频提文案',
    icon: '🎬',
    description: '短视频爆款文案',
    path: '/tool/short-video-caption',
    color: 'bg-orange-500',
  },
  {
    id: 'forbidden-words',
    name: '违禁词查询',
    icon: '⚠️',
    description: '检测违规敏感词',
    path: '/tool/forbidden-words',
    color: 'bg-red-500',
  },
  {
    id: 'ai-image-generation',
    name: 'AI图像生成',
    icon: '🎨',
    description: 'AI智能生成精美图片',
    path: '/tool/ai-image-generation',
    color: 'bg-pink-500',
  },
  {
    id: 'cover-generator',
    name: '封面图制作',
    icon: '🖼️',
    description: '多平台封面一键生成',
    path: '/tool/cover-generator',
    color: 'bg-indigo-500',
  },
  {
    id: 'coming-soon',
    name: '更多工具',
    icon: '🚀',
    description: '敬请期待更多功能',
    path: '/tool/coming-soon',
    color: 'bg-gray-400',
  },
];

// 根据路径获取当前工具
export const getCurrentTool = (path: string): ToolMenuItem | undefined => {
  return TOOL_MENU.find(tool => tool.path === path);
};
