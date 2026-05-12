import crypto from 'crypto';

const ALIBABA_CLOUD_ACCESS_KEY_ID = process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
const ALIBABA_CLOUD_ACCESS_KEY_SECRET = process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;
const SIGN_NAME = process.env.SMS_SIGN_NAME;
const TEMPLATE_CODE = process.env.SMS_TEMPLATE_CODE;

interface SendSmsResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

interface SmsRecord {
  phone: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

const smsRecords = new Map<string, SmsRecord>();

function generateSignature(params: Record<string, string>, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  let canonicalQueryString = '';
  for (const key of sortedKeys) {
    canonicalQueryString += `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}&`;
  }
  canonicalQueryString = canonicalQueryString.slice(0, -1);
  
  const stringToSign = `GET&%2F&${encodeURIComponent(canonicalQueryString)}`;
  const hmac = crypto.createHmac('sha1', `${secret}&`);
  return hmac.update(stringToSign).digest('base64');
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendSms(phone: string): Promise<SendSmsResponse> {
  if (!ALIBABA_CLOUD_ACCESS_KEY_ID || !ALIBABA_CLOUD_ACCESS_KEY_SECRET) {
    console.warn('SMS service not configured, using mock mode');
    
    const code = generateCode();
    const now = Date.now();
    
    smsRecords.set(phone, {
      phone,
      code,
      createdAt: now,
      expiresAt: now + 5 * 60 * 1000,
      attempts: 0
    });
    
    console.log(`Mock SMS sent: ${code} to ${phone}`);
    
    return {
      success: true,
      message: '验证码发送成功'
    };
  }

  const now = Date.now();
  const existingRecord = smsRecords.get(phone);
  
  if (existingRecord && now - existingRecord.createdAt < 60000) {
    return {
      success: false,
      message: '请等待1分钟后再发送验证码'
    };
  }

  const code = generateCode();
  const expiresAt = now + 5 * 60 * 1000;

  smsRecords.set(phone, {
    phone,
    code,
    createdAt: now,
    expiresAt,
    attempts: 0
  });

  const params: Record<string, string> = {
    AccessKeyId: ALIBABA_CLOUD_ACCESS_KEY_ID,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: phone,
    RegionId: 'cn-hangzhou',
    SignName: SIGN_NAME || '',
    SignatureMethod: 'HMAC-SHA1',
    SignatureNonce: crypto.randomUUID().replace(/-/g, ''),
    SignatureVersion: '1.0',
    TemplateCode: TEMPLATE_CODE || '',
    TemplateParam: JSON.stringify({ code }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Version: '2017-05-25'
  };

  params.Signature = generateSignature(params, ALIBABA_CLOUD_ACCESS_KEY_SECRET);

  const queryString = new URLSearchParams(params).toString();
  const url = `https://dysmsapi.aliyuncs.com/?${queryString}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (data.Code === 'OK') {
      return {
        success: true,
        message: '验证码发送成功',
        requestId: data.RequestId
      };
    } else {
      smsRecords.delete(phone);
      return {
        success: false,
        message: data.Message || '发送失败'
      };
    }
  } catch (error) {
    smsRecords.delete(phone);
    console.error('Send SMS error:', error);
    
    return {
      success: false,
      message: '发送失败，请稍后重试'
    };
  }
}

export function verifySmsCode(phone: string, code: string): {
  success: boolean;
  message: string;
} {
  const record = smsRecords.get(phone);
  
  if (!record) {
    return {
      success: false,
      message: '请先获取验证码'
    };
  }

  if (Date.now() > record.expiresAt) {
    smsRecords.delete(phone);
    return {
      success: false,
      message: '验证码已过期，请重新获取'
    };
  }

  if (record.attempts >= 5) {
    smsRecords.delete(phone);
    return {
      success: false,
      message: '验证次数过多，请重新获取验证码'
    };
  }

  if (record.code === code) {
    smsRecords.delete(phone);
    return {
      success: true,
      message: '验证成功'
    };
  }

  record.attempts++;
  smsRecords.set(phone, record);
  
  return {
    success: false,
    message: `验证码错误，还剩 ${5 - record.attempts} 次机会`
  };
}

export function clearSmsRecord(phone: string): void {
  smsRecords.delete(phone);
}