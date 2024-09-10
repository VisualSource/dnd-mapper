import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
    component: () => (
        <div className="h-full w-full flex bg-gray-800">
            <Outlet />
            <TanStackRouterDevtools />
        </div>
    ),
});