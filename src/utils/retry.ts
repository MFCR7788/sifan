/**
 * 重试函数
 * @param fn 要执行的函数
 * @param maxRetries 最大重试次数
 * @param delay 重试延迟（毫秒）
 * @param backoffFactor 退避因子
 * @returns 函数执行结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoffFactor: number = 2
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      if (i > 0) {
        console.log(`重试 ${i}/${maxRetries}...`);
        // 计算退避延迟
        const currentDelay = delay * Math.pow(backoffFactor, i - 1);
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`尝试 ${i + 1} 失败:`, lastError.message);
      
      if (i === maxRetries) {
        throw lastError;
      }
    }
  }
  
  // 如果循环正常结束（理论上不会发生），抛出一个默认错误
  throw lastError || new Error('重试失败');
}

/**
 * 带超时的重试函数
 * @param fn 要执行的函数
 * @param timeout 超时时间（毫秒）
 * @param maxRetries 最大重试次数
 * @param delay 重试延迟（毫秒）
 * @returns 函数执行结果
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeout: number = 30000,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`操作超时，超过 ${timeout}ms`)), timeout);
  });
  
  return Promise.race([
    retry(fn, maxRetries, delay),
    timeoutPromise
  ]);
}
