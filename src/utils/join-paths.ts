export const joinPaths = (...segments: string[]): string => {
  const joined = segments
    .map(s => s.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  
  return joined ? `/${joined}` : '/';
};