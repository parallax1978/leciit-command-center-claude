import { describe, expect, it } from 'vitest'
import { DEMO_VIDEO, resolveDemoSource } from '../config/demoVideo'

describe('resolveDemoSource', () => {
  it('shows the screenshot state when no media is configured', () => {
    expect(resolveDemoSource({ src: '', embedUrl: '' })).toBe('screenshot')
    expect(resolveDemoSource({ src: '  ', embedUrl: '\n' })).toBe('screenshot')
  })

  it('prefers a local src over an embed', () => {
    expect(resolveDemoSource({ src: '/demo.mp4', embedUrl: 'https://player.example/embed/1' })).toBe('native')
  })

  it('uses the embed only when src is empty', () => {
    expect(resolveDemoSource({ src: '', embedUrl: 'https://player.example/embed/1' })).toBe('embed')
  })

  it('ships with every media field empty because no recording was supplied', () => {
    expect(DEMO_VIDEO).toEqual({ src: '', embedUrl: '', poster: '', captions: '' })
    expect(resolveDemoSource(DEMO_VIDEO)).toBe('screenshot')
  })
})
