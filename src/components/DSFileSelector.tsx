import { open } from "@tauri-apps/plugin-dialog";
import { stat } from "@tauri-apps/plugin-fs";
import { sep } from "@tauri-apps/api/path";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Trash, Trash2 } from "lucide-react";

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${Number.parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`
}

export const DSFileSelector: React.FC<{ onChange: (value: string) => void, value: string }> = ({ value, onChange }) => {
    const [filepaths, setFilepaths] = useState<string[]>([]);
    const data = useLiveQuery(async () => {
        return Promise.all(filepaths.map(async e => {
            const metadata = await stat(e);
            const filename = e.split(sep()).at(-1);
            return { filename, size: formatBytes(metadata.size) }
        }));
    }, [filepaths], []);


    return (
        <div className="w-full border rounded-md border-dashed overflow-hidden">
            <ul className="overflow-y-scroll h-40 space-y-2">
                {data.map((e, i) => (
                    <li key={`file_${i + 1}`} className="flex justify-between items-center px-2">
                        <span>{e.filename}: <span className="text-muted-foreground">{e.size}</span></span>
                        <Button variant="destructive" size="icon">
                            <Trash2 />
                        </Button>
                    </li>
                ))}
            </ul>
            <Separator />
            <div className="flex justify-end p-2">
                <Button onClick={async () => {
                    const file = await open({
                        multiple: false,
                        directory: false,
                        filters: [
                            { extensions: ["ds"], name: "Dungeon Scroll" },
                            { extensions: ["json"], name: "Json" }],
                        title: "Select DS file",
                    });
                    if (!file) return;
                    setFilepaths(e => [...e, file]);
                    //onChange(file);
                }} type="button">
                    Add Layout
                </Button>
            </div>

        </div>




    );
}