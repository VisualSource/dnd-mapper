import { forwardRef } from "react";
import type { DialogHandle } from "../Dialog";
import { SelectDialog } from "./SelectDialog";

export const LayerSelectDialog = forwardRef<DialogHandle, { options?: { name: string; value: string }[] }>(({ options = [] }, ref) => {
    return (
        <SelectDialog options={options} eventName="dialog::layer-select-dialog" ref={ref} title="Select Layer" notFoundText="No layer found" searchText="Search Layers" />
    );
})