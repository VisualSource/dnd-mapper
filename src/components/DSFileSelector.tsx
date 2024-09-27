import { open } from "@tauri-apps/plugin-dialog";
import { stat } from "@tauri-apps/plugin-fs";
import { sep } from "@tauri-apps/api/path";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`
}

export const DSFileSelector: React.FC<{ onChange: (value: string) => void, value: string }> = ({ value, onChange }) => {
    const [filepath, setFilepath] = useState(value);
    const data = useLiveQuery(async () => {
        if (!filepath) return null;
        const metadata = await stat(filepath);
        const filename = filepath.split(sep()).at(-1);
        return { filename, size: formatBytes(metadata.size) }
    }, [filepath]);


    return (
        <button onClick={async () => {
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
        }} className="w-full h-40 hover:bg-gray-700/50 transition border rounded-md border-dashed" type="button">
            {data ? (
                <div>
                    <h5>{data.filename}</h5>
                    <p className="text-muted-foreground text-sm">{data.size}</p>
                </div>
            ) : (
                <div>Select layout file</div>
            )}
        </button>
    );
}