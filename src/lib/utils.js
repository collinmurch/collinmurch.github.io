import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date) {
    if (!date) return "No date";

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";

    return dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function toISODate(date) {
    if (!date) return null;
    const dateObj = date instanceof Date ? date : new Date(date);
    const time = dateObj.getTime();
    if (!Number.isFinite(time)) return null;
    return new Date(time).toISOString();
}
