'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
}

export default function ChatBox() {
	const [isOpen, setIsOpen] = useState(false);
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// 自动滚动到底部
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isOpen]);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			role: 'user',
			content: input.trim(),
			timestamp: Date.now(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			// 调用聊天API
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: userMessage.content,
					conversationHistory: messages.map(msg => ({
						role: msg.role,
						content: msg.content,
					})),
				}),
			});

			if (!response.ok) {
				throw new Error('聊天服务异常');
			}

			// 读取流式响应
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error('无法读取响应流');
			}

			// 创建助手消息
			const assistantMessage: Message = {
				role: 'assistant',
				content: '',
				timestamp: Date.now(),
			};
			setMessages(prev => [...prev, assistantMessage]);

			// 逐步读取流式内容
			let buffer = '';
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				buffer += chunk;

				// 更新最后一条消息的内容
				setMessages(prev => {
					const newMessages = [...prev];
					newMessages[newMessages.length - 1] = {
						...newMessages[newMessages.length - 1],
						content: buffer,
					};
					return newMessages;
				});
			}
		} catch (error: any) {
			console.error('Chat error:', error);
			setMessages(prev => [
				...prev,
				{
					role: 'assistant',
					content: '抱歉，服务暂时不可用，请稍后再试。',
					timestamp: Date.now(),
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="fixed bottom-6 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform z-50 border border-gray-200"
				aria-label="打开客服聊天"
			>
				<div className="relative w-12 h-12">
					<Image
						src="/小超人.png"
						alt="魔法超人AIGC"
						fill
						className="object-contain"
						priority
					/>
				</div>
			</button>
		);
	}

	return (
		<div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
			{/* 头部 */}
			<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
				<div>
					<h3 className="text-lg font-semibold text-gray-900">智能客服</h3>
					<p className="text-xs text-gray-500">魔法超人AIGC</p>
				</div>
				<button
					onClick={() => setIsOpen(false)}
					className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
					aria-label="关闭客服聊天"
				>
					<svg
						className="w-5 h-5 text-gray-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			{/* 消息列表 */}
			<div className="flex-1 overflow-y-auto p-5 space-y-4">
				{messages.length === 0 && (
					<div className="text-center text-gray-400 mt-20">
						<p className="text-sm">您好！我是魔法超人AIGC的智能客服</p>
						<p className="text-sm mt-2">有什么可以帮您的吗？</p>
					</div>
				)}

				{messages.map((message, index) => (
					<div
						key={index}
						className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
					>
						<div
							className={`max-w-[80%] rounded-2xl px-4 py-3 ${
								message.role === 'user'
									? 'bg-black text-white rounded-br-md'
									: 'bg-gray-100 text-gray-900 rounded-bl-md'
							}`}
						>
							<p className="text-sm whitespace-pre-wrap break-words">
								{message.content}
							</p>
						</div>
					</div>
				))}

				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
							<div className="flex space-x-2">
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
								<div
									className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style={{ animationDelay: '0.2s' }}
								/>
								<div
									className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
									style={{ animationDelay: '0.4s' }}
								/>
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* 输入框 */}
			<div className="p-4 border-t border-gray-100">
				<div className="flex items-end space-x-3">
					<textarea
						value={input}
						onChange={e => setInput(e.target.value)}
						onKeyDown={handleKeyPress}
						placeholder="输入您的问题..."
						className="flex-1 resize-none bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
						rows={1}
						style={{ minHeight: '44px', maxHeight: '120px' }}
						disabled={isLoading}
					/>
					<button
						onClick={handleSend}
						disabled={isLoading || !input.trim()}
						className="w-11 h-11 bg-black rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="发送消息"
					>
						<svg
							className="w-5 h-5 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
