import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { StageSelectionDialog, type StageSelectionDialogHandle } from "../components/dialog/StageSelectionDialog";

export const Route = createFileRoute("/")({
    component: Index,
});

function Index() {
    const navigate = useNavigate();
    const dialogRef = useRef<StageSelectionDialogHandle>(null);
    return (
        <div>
            <StageSelectionDialog ref={dialogRef} onSelect={(id) => {
                navigate({ to: "/control/$id", params: { id } });
            }} />
            <div>
                <Link to="/stage-editor">Stage Editor</Link>
                <Link to="/entity-editor">Entity Editor</Link>
                <button type="button" onClick={() => dialogRef.current?.show()}>Run Stage</button>
            </div>
        </div>
    );
}