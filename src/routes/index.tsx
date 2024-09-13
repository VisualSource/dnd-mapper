import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    return (
        <div>
            <div>
                <Link to="/stage-editor">Stage Editor</Link>
                <Link to="/entity-editor">Entity Editor</Link>
                <button type="button">Run Stage</button>
            </div>
        </div>
    );
}