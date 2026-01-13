/**
 * 微信开放平台OAuth 2.0认证工具
 *
 * 用于网站微信扫码登录、获取用户信息等功能
 */

interface WechatAccessTokenResponse {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	openid: string;
	scope: string;
	unionid?: string;
	errcode?: number;
	errmsg?: string;
}

interface WechatUserInfo {
	openid: string;
	nickname: string;
	sex: number;
	province: string;
	city: string;
	country: string;
	headimgurl: string;
	privilege: string[];
	unionid?: string;
	errcode?: number;
	errmsg?: string;
}

interface WechatPhoneNumber {
	errcode: number;
	errmsg: string;
	phone_info: {
		phoneNumber: string;
		purePhoneNumber: string;
		countryCode: string;
		watermark: {
			timestamp: number;
			appid: string;
		};
	};
}

// 微信开放平台配置
const WECHAT_OPEN_APPID = process.env.WECHAT_OPEN_APPID || '';
const WECHAT_OPEN_APPSECRET = process.env.WECHAT_OPEN_APPSECRET || '';
const WECHAT_OPEN_REDIRECT_URI = process.env.WECHAT_OPEN_REDIRECT_URI || '';

/**
 * 生成微信授权URL（网站扫码登录）
 */
export function getWechatAuthUrl(state: string): string {
	const params = new URLSearchParams({
		appid: WECHAT_OPEN_APPID,
		redirect_uri: WECHAT_OPEN_REDIRECT_URI,
		response_type: 'code',
		scope: 'snsapi_login', // 网站扫码登录
		state: state,
	});

	return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
}

/**
 * 用code换取access_token
 */
export async function getWechatAccessToken(code: string): Promise<WechatAccessTokenResponse | null> {
	try {
		const url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
		const params = new URLSearchParams({
			appid: WECHAT_OPEN_APPID,
			secret: WECHAT_OPEN_APPSECRET,
			code: code,
			grant_type: 'authorization_code',
		});

		const response = await fetch(`${url}?${params.toString()}`);
		const data: WechatAccessTokenResponse = await response.json();

		// 检查是否有错误
		if (data.errcode && data.errcode !== 0) {
			console.error('获取access_token失败:', data.errmsg);
			return null;
		}

		return data;
	} catch (error) {
		console.error('获取access_token异常:', error);
		return null;
	}
}

/**
 * 获取微信用户信息
 */
export async function getWechatUserInfo(
	access_token: string,
	openid: string
): Promise<WechatUserInfo | null> {
	try {
		const url = 'https://api.weixin.qq.com/sns/userinfo';
		const params = new URLSearchParams({
			access_token: access_token,
			openid: openid,
			lang: 'zh_CN',
		});

		const response = await fetch(`${url}?${params.toString()}`);
		const data: WechatUserInfo = await response.json();

		// 检查是否有错误
		if (data.errcode && data.errcode !== 0) {
			console.error('获取用户信息失败:', data.errmsg);
			return null;
		}

		return data;
	} catch (error) {
		console.error('获取用户信息异常:', error);
		return null;
	}
}

/**
 * 刷新access_token
 */
export async function refreshWechatAccessToken(
	refresh_token: string
): Promise<WechatAccessTokenResponse | null> {
	try {
		const url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
		const params = new URLSearchParams({
			appid: WECHAT_OPEN_APPID,
			grant_type: 'refresh_token',
			refresh_token: refresh_token,
		});

		const response = await fetch(`${url}?${params.toString()}`);
		const data: WechatAccessTokenResponse = await response.json();

		// 检查是否有错误
		if (data.errcode && data.errcode !== 0) {
			console.error('刷新access_token失败:', data.errmsg);
			return null;
		}

		return data;
	} catch (error) {
		console.error('刷新access_token异常:', error);
		return null;
	}
}

/**
 * 检查access_token是否有效
 */
export async function checkWechatAccessToken(
	access_token: string,
	openid: string
): Promise<boolean> {
	try {
		const url = 'https://api.weixin.qq.com/sns/auth';
		const params = new URLSearchParams({
			access_token: access_token,
			openid: openid,
		});

		const response = await fetch(`${url}?${params.toString()}`);
		const data: any = await response.json();

		return data.errcode === 0;
	} catch (error) {
		console.error('检查access_token异常:', error);
		return false;
	}
}

/**
 * 获取用户手机号（需要特殊权限）
 * 注意：这个接口需要企业认证的应用，并且需要申请特殊权限
 */
export async function getWechatPhoneNumber(
	access_token: string,
	code: string
): Promise<WechatPhoneNumber | null> {
	try {
		const url = 'https://api.weixin.qq.com/wxa/business/getuserphonenumber';
		const params = new URLSearchParams({
			access_token: access_token,
		});

		const response = await fetch(`${url}?${params.toString()}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ code }),
		});

		const data: WechatPhoneNumber = await response.json();

		// 检查是否有错误
		if (data.errcode !== 0) {
			console.error('获取手机号失败:', data.errmsg);
			return null;
		}

		return data;
	} catch (error) {
		console.error('获取手机号异常:', error);
		return null;
	}
}
