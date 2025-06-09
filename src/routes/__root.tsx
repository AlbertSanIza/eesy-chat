import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
    component: RootComponent
})

function RootComponent() {
    return (
        <>
            <Outlet />
            <div>
                <Link to="/">Home</Link>
                <Link to="/chat">About</Link>
            </div>
            <TanStackRouterDevtools />
        </>
    )
}
