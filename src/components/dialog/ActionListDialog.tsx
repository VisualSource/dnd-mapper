import { forwardRef } from "react";
import { type Action, ACTIONS, getDefaultAction } from "@/lib/renderer/actions";
import { SelectDialog } from "./SelectDialog";
import type { DialogHandle } from "../Dialog";

export const ActionListDialog = forwardRef<DialogHandle>((_, ref) => {
    return (
        <SelectDialog title="Select Action" searchText="Search for action...." notFoundText="No actions found" modArg={(id) => getDefaultAction(id as Action["type"] | null)} eventName="dialog::actions-list" options={ACTIONS} ref={ref} />
    )
});