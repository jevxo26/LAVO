export const catchServiceAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      
      console.error('Service Layer Error:', error);
      throw error; 
    }
  }) as T;
};
