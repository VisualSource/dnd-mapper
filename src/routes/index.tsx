import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    return (
        <div>
            <div>
                <button type="button">Create New</button>
            </div>
            <ul>
                <Link to="/control">Content Name</Link>
            </ul>
        </div>
    );
}