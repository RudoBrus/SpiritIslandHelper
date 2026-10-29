export function joinClasses(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes
    .filter((className) => typeof className === 'string' && className.length > 0)
    .join(' ')
}
