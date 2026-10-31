export type SpiritComplexity = 'Low' | 'Moderate' | 'High' | 'Very High'

export type SpiritAspect = {
  readonly id: string
  readonly name: string
  readonly expansion: string
  readonly complexityModifier: '+' | '=' | '−'
}

export type Spirit = {
  readonly id: string
  readonly name: string
  readonly artworkUrl: string | null
  readonly artworkPageUrl: string | null
  readonly complexity: SpiritComplexity
  readonly expansion: string
  readonly aspects: readonly SpiritAspect[]
}
