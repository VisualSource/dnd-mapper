import { open } from '@tauri-apps/plugin-dialog';
import { convertFileSrc } from "@tauri-apps/api/core";
import { type Control, Controller, type FieldValues } from 'react-hook-form';

export const ImageSelect: React.FC<{ control: Control<FieldValues> | undefined, name: string }> = ({ control, name }) => {
    return (
        <Controller control={control} name={name} render={({ field, fieldState }) => (
            <div className="p-2">
                <div className='flex gap-2'>
                    <div className="relative h-11 w-11">
                        <img src={field.value} className="h-full w-full object-cover" alt="image-from-system" />
                    </div>
                    <button type="button" onClick={async () => {
                        const file = await open({
                            multiple: false,
                            directory: false,
                            title: "Select File"
                        });
                        if (!file) return;
                        field.onChange(convertFileSrc(file));
                    }}>Select</button>

                </div>
                <span className="text-xs text-ellipsis max-w-11 overflow-hidden whitespace-nowrap">{field.value}</span>
                {fieldState.error ? <p>{fieldState.error.message}</p> : null}
            </div>
        )} />
    );
}