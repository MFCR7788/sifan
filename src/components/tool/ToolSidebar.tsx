'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOOL_MENU, ToolMenuItem } from '@/lib/toolMenu';

interface ToolSidebarProps {
  currentPath: string;
}

export default function ToolSidebar({ currentPath }: ToolSidebarProps) {
  const pathname = usePathname();

  const isCurrentTool = (tool: ToolMenuItem) => {
    return currentPath === tool.path;
  };

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">AI 工具集</h2>
            <p className="text-sm text-gray-500 mt-1">智能创作工具箱</p>
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              {TOOL_MENU.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isCurrentTool(tool)
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isCurrentTool(tool) ? tool.color : 'bg-gray-100'}
                    `}>
                      <span className="text-sm">{tool.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{tool.name}</div>
                      <div className="text-xs text-gray-400 truncate">{tool.description}</div>
                    </div>

                    {isCurrentTool(tool) && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm">💡</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">使用提示</div>
              <div className="text-xs text-gray-500">提升创作效率</div>
            </div>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>选择合适的平台和风格</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>详细描述可获得更好效果</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>历史记录方便再次使用</span>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
