const testMemberAPI = async () => {
  try {
    // 1. 先登录
    console.log('1. 登录中...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '15967675767',
        password: 'Qf229888777'
      })
    });

    if (!loginRes.ok) {
      console.error('登录失败:', await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    console.log('登录成功:', JSON.stringify(loginData.user, null, 2));

    // 2. 获取会员信息（使用同一个请求会话，模拟浏览器）
    console.log('\n2. 获取会员信息...');
    const memberRes = await fetch('http://localhost:5000/api/user/me/member', {
      credentials: 'include', // 重要：包含cookies
    });

    const memberText = await memberRes.text();
    console.log('会员API响应状态:', memberRes.status);
    console.log('会员API响应内容:', memberText);

    if (memberRes.ok) {
      const memberData = JSON.parse(memberText);
      console.log('\n会员数据:', JSON.stringify(memberData, null, 2));
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
};

testMemberAPI();
