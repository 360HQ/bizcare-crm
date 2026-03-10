import { createContext, useContext } from "react";

import { en } from "./translations/en";
import { zh } from "./translations/zh";

export type Locale = "en" | "zh";

export type TranslationKey = keyof typeof en;

const translations: Record<Locale, Record<string, string>> = { en, zh };

export interface I18nContextValue {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function createTranslator(locale: Locale) {
	return (key: TranslationKey): string => translations[locale][key] ?? key;
}

export function useTranslation() {
	const ctx = useContext(I18nContext);
	if (!ctx) {
		throw new Error("useTranslation must be used within LocaleProvider");
	}
	return ctx;
}
