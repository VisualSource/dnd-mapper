import { open } from '@tauri-apps/plugin-dialog';
import { convertFileSrc } from "@tauri-apps/api/core";

export const ImageSelect: React.FC<{ value?: string, onChange?: (imageUrl: string) => void }> = ({ onChange, value }) => {
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
                        title: "Select Image"
                    });
                    if (!file) return;
                    onChange?.call(undefined, convertFileSrc(file));
                }}>Select</button>
            </div>
        </div>
    );
}