import { useTranslation } from "@/lib/i18n";

import { Button } from "./ui/button";

export function LocaleToggle() {
	const { locale, setLocale } = useTranslation();

	return (
		<Button
			onClick={() => setLocale(locale === "en" ? "zh" : "en")}
			size="sm"
			variant="ghost"
		>
			{locale === "en" ? "中文" : "EN"}
		</Button>
	);
}
