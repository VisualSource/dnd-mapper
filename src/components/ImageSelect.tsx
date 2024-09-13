import { open } from '@tauri-apps/plugin-dialog';
import { convertFileSrc } from "@tauri-apps/api/core";
import { useState } from "react";

export const ImageSelect: React.FC<{ defaultValue?: string, name: string, required: boolean }> = ({ defaultValue, required, name }) => {
    const [value, setValue] = useState(defaultValue);

    return (
        <div className="p-2">
            <div className='flex gap-2'>
                <div className="relative h-11 w-11">
                    <img src={value} className="h-full w-full object-cover" alt="image-from-system" />
                </div>
                <button type="button" onClick={async () => {
                    const file = await open({
                        multiple: false,
                        directory: false,
                        title: "Select File"
                    });
                    if (!file) return;
                    setValue(convertFileSrc(file));
                }}>Select</button>

            </div>
            <span className="text-xs text-ellipsis max-w-11 overflow-hidden whitespace-nowrap">{value}</span>
            <input required={required} value={value} onChange={(e) => setValue(e.target.value)} className="hidden" name={name} type="url" />
        </div>
    );
}