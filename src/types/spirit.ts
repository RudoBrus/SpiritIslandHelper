export type SpiritComplexity = 'Low' | 'Moderate' | 'High' | 'Very High'

export type Spirit = {
  readonly id: string
  readonly name: string
  readonly artworkUrl: string | null
  readonly artworkPageUrl: string
  readonly complexity: SpiritComplexity
  readonly expansion: string
}
