export interface StoreErrorEvent {
  operation: string
  message: string
  cause: unknown
}

export type StoreErrorSubscriber = (event: StoreErrorEvent) => void
