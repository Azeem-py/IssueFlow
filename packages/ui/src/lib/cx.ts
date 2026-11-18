/**
 * Joins conditional class names without pulling in a runtime dependency.
 */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}
