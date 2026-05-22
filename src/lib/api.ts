export const publicApiBasePath = '/api/public';

export function apiPlaceholder() {
  return {
    enabled: false,
    reason: 'The React migration currently reads static content; NestJS public APIs are reserved for a later phase.',
  };
}
