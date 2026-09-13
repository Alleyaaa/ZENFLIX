import { describe, expect, test } from '@jest/globals'
import { tmdbImage } from '@/lib/tmdb'

describe('TMDB URL helpers', () => {
  test('tmdbImage builds full URL', () => {
    const url = tmdbImage('/abc.jpg', 'w342')
    expect(url).toBe('https://image.tmdb.org/t/p/w342/abc.jpg')
  })
})