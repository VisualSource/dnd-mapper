import { useLiveQuery } from "dexie-react-hooks";
import { open } from "@tauri-apps/plugin-dialog";
import { useFormContext } from "react-hook-form";
import { stat } from "@tauri-apps/plugin-fs";
import { sep } from "@tauri-apps/api/path";
import { useReducer } from "react";
import { loadEditorDungeonFile } from "@/lib/loader";
import type { ResolvedStage } from "@/lib/types";
import { emitTo } from "@tauri-apps/api/event";
import { EVENTS_MAP_EDITOR, WINDOW_MAP_EDITOR } from "@/lib/consts";

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`
}

const reducer = (state: { path: string | undefined, loading: boolean, error: string | undefined }, update: { path?: string, loading?: boolean, error?: string }) => {
    return {
        ...state,
        ...update
    }
}

export const DSFileSelector: React.FC<{ onChange: (value: string) => void, defaultValue: string }> = ({ defaultValue, onChange }) => {
    const { setValue } = useFormContext<ResolvedStage>();
    const [state, dispatch] = useReducer(reducer, { path: defaultValue, loading: false, error: undefined });
    const path = state.path;
    const data = useLiveQuery(async () => {
        dispatch({ loading: true });
        try {
            if (!path?.length) return null;
            const metadata = await stat(path);
            const filename = path.split(sep()).at(-1);
            const content = await loadEditorDungeonFile(path);
            if (content) {
                setValue("map", content, { shouldDirty: true, shouldValidate: true });
                await emitTo(WINDOW_MAP_EDITOR, EVENTS_MAP_EDITOR.Load, content.data);
            }
            dispatch({ loading: false });
            return { filename, size: formatBytes(metadata.size) }
        } catch (error) {
            dispatch({ error: (error as Error).message, loading: false });
        }
    }, [path], null);

    return (
        <div className="w-full border rounded-md border-dashed overflow-hidden h-24">
            <button className="h-full w-full" onClick={async () => {
                const file = await open({
                    multiple: false,
                    directory: false,
                    filters: [
                        { extensions: ["ds"], name: "Dungeon Scroll" },
                        { extensions: ["json"], name: "Json" }],
                    title: "Select DS file",
                });
                if (!file) return;
                dispatch({ path: file });
                onChange(file);
            }} type="button">
                {state.error ? (
                    <div className="text-red-600">{state.error}</div>
                ) : state.loading ? (
                    <div>Loading</div>
                ) : !state.path ? (
                    <div>Select File</div>
                ) : (
                    <div className="flex flex-col">
                        {data?.filename}
                        <span className="text-muted-foreground text-sm">{data?.size}</span>
                    </div>
                )}
            </button>
        </div>
    );
}