import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const TanStackRouterDevtools = import.meta.env.PROD
	? () => null // Render nothing in production
	: lazy(() =>
			// Lazy load in development
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
				// For Embedded Mode
				// default: res.TanStackRouterDevtoolsPanel
			})),
		);

export const Route = createRootRoute({
	component: () => (
		<div className="h-full w-full flex">
			<Outlet />
			<Suspense>
				<TanStackRouterDevtools />
			</Suspense>
		</div>
	),
});
