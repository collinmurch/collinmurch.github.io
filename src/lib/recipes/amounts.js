const KITCHEN_DENOMINATORS = [2, 3, 4, 8, 16, 1];

const FRACTION_GLYPHS = {
	"1/2": "½",
	"1/3": "⅓",
	"2/3": "⅔",
	"1/4": "¼",
	"3/4": "¾",
	"1/8": "⅛",
	"3/8": "⅜",
	"5/8": "⅝",
	"7/8": "⅞",
};

/**
 * A number as the recipes repo writes it: kitchen fractions like "1 1/2", or
 * decimals for metric units and values no kitchen fraction is close to.
 */
export function formatNumber(value, metric = false) {
	if (!metric) {
		for (const denominator of KITCHEN_DENOMINATORS) {
			const parts = Math.round(value * denominator);
			if (parts && Math.abs(value - parts / denominator) < 1 / 50) {
				const whole = Math.floor(parts / denominator);
				const rest = parts % denominator;
				if (!rest) return String(whole);
				const fraction = `${rest}/${denominator}`;
				return whole ? `${whole} ${fraction}` : fraction;
			}
		}
	}
	if (value >= 10) return String(Math.round(value));
	return String(Number(value.toFixed(2)));
}

/**
 * One of an ingredient's amounts, multiplied by `factor` unless it is fixed or
 * written as text. `units` is the bundle's unit table, which says how each
 * unit is pluralized and whether it reads as a decimal.
 */
export function formatAmount({ value, text, unit, fixed }, factor, units) {
	if (value === undefined && text === undefined) return unit ?? "";
	const scaled = fixed ? value : value * factor;
	const quantity = text ?? formatNumber(scaled, units[unit]?.metric);
	if (!unit) return quantity;
	const many = text !== undefined || scaled > 1;
	return `${quantity} ${(many && units[unit]?.plural) || unit}`;
}

/**
 * An ingredient's whole amount, scaled: "1 lb + 2 cups". At a factor of 1 it
 * reads exactly as the bundle's own `amount`.
 */
export function scaleAmounts(amounts, factor, units) {
	return amounts
		.map((amount) => formatAmount(amount, factor, units))
		.filter(Boolean)
		.join(" + ");
}

/** Typesets kitchen fractions as single glyphs: "1 1/2 cups" reads "1½ cups". */
export function fractionGlyphs(text) {
	return text.replaceAll(/(?:(\d+) )?(\d+\/\d+)/g, (match, whole, fraction) =>
		FRACTION_GLYPHS[fraction] ? `${whole ?? ""}${FRACTION_GLYPHS[fraction]}` : match,
	);
}
