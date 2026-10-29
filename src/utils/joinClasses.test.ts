import { describe, expect, it } from 'vitest'
import { joinClasses } from './joinClasses'

describe('joinClasses', () => {
  it('joins non-empty class names and ignores absent values', () => {
    expect(joinClasses('rounded-lg', false, undefined, 'text-white', '')).toBe(
      'rounded-lg text-white',
    )
  })
})
