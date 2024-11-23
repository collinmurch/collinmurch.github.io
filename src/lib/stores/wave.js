import { writable } from "svelte/store";

// 0 = down, 1 = up
export const waveState = writable(0);
