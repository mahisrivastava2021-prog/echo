import type { EchoTurn } from './engine'

/** Chat history lives only in React state (memory). It is never stored or sent anywhere. */
export type ChatMessage = { id: number; role: 'user'; text: string } | ({ id: number; role: 'echo' } & EchoTurn)
