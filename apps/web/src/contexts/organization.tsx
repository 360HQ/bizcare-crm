import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

import { trpc } from "@/utils/trpc";

interface OrganizationContextValue {
	currentOrg: {
		id: string;
		name: string;
		slug: string;
		role: string | null;
	} | null;
	isLoading: boolean;
	organizationId: string | null;
	organizations: Array<{
		id: string;
		name: string;
		slug: string;
		role: string | null;
	}>;
	setOrganizationId: (id: string | null) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(
	null
);

const STORAGE_KEY = "bizcare-crm-org-id";

export function OrganizationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [organizationId, setOrganizationIdState] = useState<string | null>(
		() => {
			try {
				return localStorage.getItem(STORAGE_KEY);
			} catch {
				return null;
			}
		}
	);

	const setOrganizationId = useCallback((id: string | null) => {
		setOrganizationIdState(id);
		try {
			if (id) {
				localStorage.setItem(STORAGE_KEY, id);
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch {
			// ignore storage errors
		}
	}, []);

	const { data, isLoading } = useQuery(
		trpc.core.organization.list.queryOptions()
	);

	const organizations = useMemo(
		() =>
			(data ?? []).map((org) => ({
				id: org.id,
				name: org.name,
				slug: org.slug,
				role: org.role,
			})),
		[data]
	);

	const currentOrg = useMemo(
		() => organizations.find((o) => o.id === organizationId) ?? null,
		[organizations, organizationId]
	);

	const value = useMemo(
		() => ({
			organizationId,
			setOrganizationId,
			organizations,
			isLoading,
			currentOrg,
		}),
		[organizationId, setOrganizationId, organizations, isLoading, currentOrg]
	);

	return <OrganizationContext value={value}>{children}</OrganizationContext>;
}

export function useOrganization() {
	const ctx = useContext(OrganizationContext);
	if (!ctx) {
		throw new Error("useOrganization must be used within OrganizationProvider");
	}
	return ctx;
}
