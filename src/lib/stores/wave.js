import { writable } from "svelte/store";

export const waveState = writable(0); // 0 = down, 1 = up
