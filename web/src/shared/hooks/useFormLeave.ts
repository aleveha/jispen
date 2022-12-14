import { useRouter } from "next/router";
import Nprogress from "nprogress";
import { useCallback, useEffect, useState } from "react";

const useBeforeUnload = (enabled: boolean, message?: string) => {
	const handler = useCallback(
		(event: BeforeUnloadEvent) => {
			if (!enabled) {
				return;
			}

			event.preventDefault();

			if (message) {
				event.returnValue = message;
			}

			return message;
		},
		[enabled, message]
	);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		window.addEventListener("beforeunload", handler);

		return () => window.removeEventListener("beforeunload", handler);
	}, [enabled, handler]);
};

export const useFormLeave = (enable: boolean) => {
	const router = useRouter();
	const [showLeaveModal, setShowLeaveModal] = useState(false);
	const [pathname, setPathname] = useState<string | null>(null);

	useBeforeUnload(enable, "Are you sure you want to leave?");

	const onRouteChangeStart = useCallback(
		(pathname: string) => {
			if (!enable) {
				return;
			}

			setShowLeaveModal(true);
			setPathname(pathname);
			throw "\nRoute change aborted. Please ignore this error";
		},
		[enable]
	);
	const removeRouteChangeStart = useCallback(() => router.events.off("routeChangeStart", onRouteChangeStart), [router.events, onRouteChangeStart]);

	const handleUserChoice = useCallback(
		(leave: boolean) => async () => {
			setShowLeaveModal(false);

			if (!leave) {
				setPathname(null);
				Nprogress.done();
				return;
			}

			removeRouteChangeStart();

			if (pathname) {
				await router.push(pathname);
			}
		},
		[pathname, removeRouteChangeStart, router]
	);

	useEffect(() => {
		router.events.on("routeChangeStart", onRouteChangeStart);

		return removeRouteChangeStart;
	}, [onRouteChangeStart, removeRouteChangeStart, router.events]);

	return [showLeaveModal, handleUserChoice] as const;
};
