// Support-chat memory (frontend only).
//
// The messages live here, outside the screen, so they are still there when you
// leave the Support screen and come back. They are only cleared when
// resetSupportChat() is called (do that when the user logs out).

import { useSyncExternalStore } from 'react';

export type Msg =
  | { id: string; kind: 'bot' | 'me'; text: string }
  | { id: string; kind: 'stamp'; text: string };

let messages: Msg[] = [];
let nextId = 1;
let generation = 0; // bumps on every reset, so late bot replies can be dropped
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const getSnapshot = () => messages;

export function addSupportMessage(kind: 'bot' | 'me', text: string): void {
  messages = [...messages, { id: `m${nextId++}`, kind, text }];
  emit();
}

// Adds a message after a delay (used for the bot's reply). If the chat is reset
// before the delay ends (e.g. the user logs out), the message is dropped.
export function addSupportMessageLater(kind: 'bot' | 'me', text: string, delayMs: number): void {
  const gen = generation;
  setTimeout(() => {
    if (gen === generation) addSupportMessage(kind, text);
  }, delayMs);
}

// Called on logout: wipes the conversation so the next login starts blank.
export function resetSupportChat(): void {
  generation += 1;
  messages = [];
  emit();
}

export function useSupportMessages(): Msg[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
