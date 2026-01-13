'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', phone: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navigation />

      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-gray-900 tracking-tight">
            联系我们
          </h1>
          <p className="text-xl text-gray-600 mt-6">
            期待与您的合作
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold">联系方式</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">地址</h3>
                  <p className="text-lg">浙江省杭州市上城区元宇宙基地5幢115室</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">电话</h3>
                  <p className="text-lg">400-0678-558</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">邮箱</h3>
                  <p className="text-lg">229888777@qq.com</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">工作时间</h3>
                  <p className="text-lg">周一至周五 9:00 - 18:00</p>
                </div>

                {/* 客服微信 */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">客服微信</h3>
                  <div className="flex flex-col items-center space-y-3">
                    <img
                      src="/assets/KF.png"
                      alt="客服微信"
                      className="w-48 h-auto rounded-lg border border-gray-200"
                    />
                    <p className="text-sm text-gray-600">扫描二维码添加客服微信</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-8">留言咨询</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-2">
                    姓名
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                    placeholder="请输入您的姓名"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-2">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                    placeholder="请输入您的联系电话"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                    电子邮箱
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                    placeholder="请输入您的邮箱"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-2">
                    留言内容
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
                    placeholder="请输入您的问题或建议"
                    required
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-center text-sm">✓ 留言提交成功！</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-center text-sm">提交失败，请稍后重试</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '提交中...' : '提交留言'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
