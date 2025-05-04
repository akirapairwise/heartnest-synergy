
// Cache management for the weekly summaries
export const saveSummaryToCache = (userId: string, summary: string): void => {
  const cacheKey = `weeklyAIInsight:${userId}`;
  localStorage.setItem(cacheKey, summary);
  localStorage.setItem(`${cacheKey}:ts`, Date.now().toString());
};

export const getSummaryFromCache = (userId: string): string | null => {
  const cacheKey = `weeklyAIInsight:${userId}`;
  const cacheTimestamp = localStorage.getItem(`${cacheKey}:ts`);
  const cacheValue = localStorage.getItem(cacheKey);
  
  if (
    cacheValue &&
    cacheTimestamp &&
    Date.now() - Number(cacheTimestamp) < 24 * 60 * 60 * 1000 // 24 hours
  ) {
    return cacheValue;
  }
  
  return null;
};
