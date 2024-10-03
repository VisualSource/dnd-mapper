import { open } from "@tauri-apps/plugin-dialog";
import { stat } from "@tauri-apps/plugin-fs";
import { sep } from "@tauri-apps/api/path";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Trash2 } from "lucide-react";

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`
}

export const DSFileSelector: React.FC<{ onChange: (value: string) => void, value: string }> = ({ value, onChange }) => {
    const [filepath, setFilepath] = useState<string>(value);
    const data = useLiveQuery(async () => {
        if (!filepath?.length) return null;
        const metadata = await stat(filepath);
        const filename = filepath.split(sep()).at(-1);
        return { filename, size: formatBytes(metadata.size) }
    }, [filepath], null);

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
                setFilepath(file);
                onChange(file);
            }} type="button">
                {data === undefined ? (
                    <div>Loading</div>
                ) : data === null ? (
                    <div>Select File</div>
                ) : (
                    <div className="flex flex-col">
                        {data.filename}
                        <span className="text-muted-foreground text-sm">{data.size}</span>
                    </div>
                )}
            </button>
        </div>
    );
}