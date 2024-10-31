import { useContext, createContext, useCallback, useRef, useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { listen } from "@tauri-apps/api/event";
import update from "immutability-helper";
import type { UUID } from "node:crypto";
import { AdditionEntityDialog, type AdditionEntityDialogHandle } from "../dialog/AdditionEntityDialog";
import { StageGroupDialog, type StageGroupDialogHandle } from "../dialog/StageGroupDialog";
import type { Entity, ReslovedEntityInstance, ResolvedStage } from "@/lib/types";
import type { Dungeon } from "@/lib/renderer/dungeonScrawl/types";
import { LayerSelectDialog } from "../dialog/LayerSelectDialog";
import { ActionListDialog } from "../dialog/ActionListDialog";
import { emitEvent, WINDOW_MAP_EDITOR } from "@/lib/consts";
import { TriggerListDialog } from "./TriggersListDialog";
import type { DialogHandle } from "../Dialog";

export enum OpenDialog {
    ActionList = 0,
    TriggerList = 1,
    SelectLayer = 2,
    AddEntity = 3,
    AddStageGroup = 4
}
type Refs = {
    entities: {
        layerId: string;
        layerName: string;
        options: {
            id: `${string}-${string}-${string}-${string}-${string}`;
            name: string;
        }[];
    }[];
    objects: {
        name: string;
        id: `${string}-${string}-${string}-${string}-${string}`;
    }[];
} | undefined;

type TSelected = { id: UUID, type: "entity" | "object" };
type TEditorContext = {
    openDialog: (target: OpenDialog, callback?: (ev: Event) => void) => void,
    selected: TSelected | null,
    lists: Refs
}

const editorCtx = createContext<TEditorContext | null>(null);
export const useEditorContext = () => {
    const ctx = useContext(editorCtx);
    if (!ctx) throw new Error("useEditorContext should be wraped in a EditorProvider");
    return ctx;
}

export const EditorProvider: React.FC<React.PropsWithChildren<{ stage: ResolvedStage }>> = ({ children, stage }) => {
    const [lists, setLists] = useState<Refs>();
    const actionListDialogRef = useRef<DialogHandle>(null);
    const triggerListDialogRef = useRef<DialogHandle>(null);
    const layerSelectDialogRef = useRef<DialogHandle>(null);
    const stageGroupDialogRef = useRef<StageGroupDialogHandle>(null);
    const addEntityDialogRef = useRef<AdditionEntityDialogHandle>(null);
    const [selected, setSelected] = useState<{ id: UUID, type: "entity" | "object" } | null>(null);
    const openDialog = useCallback((target: OpenDialog, callback?: (ev: Event) => void) => {
        let callbackKey = null
        switch (target) {
            case OpenDialog.TriggerList: {
                if (!triggerListDialogRef.current) throw new Error("No ref")
                triggerListDialogRef.current?.show();
                callbackKey = "dialog::trigger-list";
                break;
            }
            case OpenDialog.ActionList: {
                if (!actionListDialogRef.current) throw new Error("No ref")
                actionListDialogRef.current?.show();
                callbackKey = "dialog::actions-list";
                break;
            }
            case OpenDialog.AddEntity: {
                if (!addEntityDialogRef.current) throw new Error("No ref")
                addEntityDialogRef.current?.show();
                callbackKey = "dialog::additionEntityDialog";
                break;
            }
            case OpenDialog.AddStageGroup:
                if (!stageGroupDialogRef.current) throw new Error("No ref")
                stageGroupDialogRef.current?.show();
                break;
            default:
                break;
        }
        if (callbackKey && callback) window.addEventListener(callbackKey, callback, { once: true });
    }, []);
    const form = useForm<Omit<ResolvedStage, "map">>({
        defaultValues: stage
    });
    const getValues = form.getValues;
    const setValue = form.setValue;
    const watch = form.watch;

    useEffect(() => {
        const { unsubscribe } = watch((data, event) => {
            if (!event.name?.includes("entities")) return;
            if (!data.entities || !(data as ResolvedStage).map?.data) return;

            const map = (data as ResolvedStage).map?.data;
            if (!map) return;
            const entities = Object.entries(data.entities).map(([layer, list]) => {
                return {
                    layerId: layer,
                    layerName: (map.state.document.nodes[layer as UUID] as { name: string })?.name ?? "Unknown Layer",
                    options: (list as ReslovedEntityInstance[]).map(e => ({ id: e.id, name: e.overrides.name?.length ? e.overrides.name : e.entity.name }))
                }
            });
            const objects = Object.values(map.state.document.nodes ?? {}).filter(e => e.type === "ASSET" || e.type === "DUNGEON_ASSET").map(e => ({ name: e.name, id: e.id }));
            setLists({ entities, objects });
        });
        return () => unsubscribe();
    }, [watch]);

    useEffect(() => {
        const editorSelectSub = listen<UUID>("editor-select", async (ev) => {
            setSelected({ id: ev.payload, type: "object" });
        });
        const editorAddEntity = listen<{ x: number, y: number }>("editor-add-entity", async (ev) => {
            if (!layerSelectDialogRef.current) return;
            layerSelectDialogRef.current?.show();

            const layerId = await new Promise<UUID | null>(ok => {
                window.addEventListener("dialog::layer-select-dialog", ev => ok((ev as CustomEvent<UUID | null>).detail), { once: true });
            });
            if (!layerId) return;

            if (!addEntityDialogRef.current) return;
            addEntityDialogRef.current?.show();
            const result = await new Promise<Entity | null>((ok) => {
                window.addEventListener("dialog::additionEntityDialog", (ev) => ok((ev as CustomEvent<Entity | null>).detail), { once: true });
            });
            if (!result) return;

            const id = crypto.randomUUID();

            const entity = { entity: result, id, x: ev.payload.x, y: ev.payload.y, z: 0, overrides: {} };

            const prev = getValues("entities");

            setValue(`entities.${layerId}`, update(prev[layerId], {
                $push: [entity]
            }), { shouldDirty: true, shouldTouch: true });

            await emitEvent("addEntity", { layer: layerId, entity: entity }, WINDOW_MAP_EDITOR);
        });

        return () => {
            editorAddEntity.then(e => e());
            editorSelectSub.then(e => e());
        }
    }, [getValues, setValue]);

    return (
        <editorCtx.Provider value={{
            openDialog,
            selected,
            lists
        }}>
            <ActionListDialog ref={actionListDialogRef} />
            <StageGroupDialog ref={stageGroupDialogRef} />
            <TriggerListDialog ref={triggerListDialogRef} />
            <LayerSelectDialog options={stage.map?.layers} ref={layerSelectDialogRef} />
            <AdditionEntityDialog ref={addEntityDialogRef} onAdd={(entity) => {
                window.dispatchEvent(new CustomEvent("dialog::additionEntityDialog", { detail: entity }));
            }} onClose={() => {
                window.dispatchEvent(new CustomEvent("dialog::additionEntityDialog", { detail: null }));
            }} />
            <FormProvider {...form}>
                {children}
            </FormProvider>
        </editorCtx.Provider>
    );
}