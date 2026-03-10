import { useCallback, useMemo, useState } from "react";

import { createTranslator, I18nContext, type Locale } from "@/lib/i18n";

const LOCALE_KEY = "bizcare-crm-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>(() => {
		try {
			const stored = localStorage.getItem(LOCALE_KEY);
			return stored === "zh" ? "zh" : "en";
		} catch {
			return "en";
		}
	});

	const setLocale = useCallback((l: Locale) => {
		setLocaleState(l);
		try {
			localStorage.setItem(LOCALE_KEY, l);
		} catch {
			// ignore storage errors
		}
	}, []);

	const t = useMemo(() => createTranslator(locale), [locale]);

	const value = useMemo(
		() => ({ locale, setLocale, t }),
		[locale, setLocale, t]
	);

	return <I18nContext value={value}>{children}</I18nContext>;
}
