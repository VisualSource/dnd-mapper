import type { Stage } from "../../lib/types";
import { ImageSelect } from "../ImageSelect";

export const StageForm: React.FC<{ stage?: Stage }> = () => {
    return (
        <form className="overflow-y-scroll p-2" onSubmit={(ev) => {
            ev.preventDefault();
        }}>

            <div className="flex flex-col gap-2">
                <label>Name</label>
                <input required name="name" placeholder="Name" />
                <p className="text-sm">A friendly name for this stage</p>
            </div>

            <div className="flex flex-col gap-2">
                <label>Grid Scale</label>
                <input required name="gridScale" type="number" defaultValue={28} />
                <p className="text-sm">The size of the grid cells (Default 28px)</p>
            </div>

            <ImageSelect defaultValue="" required name="backgroundImage" />
            <div className="flex flex-col">
                <label>Image Position</label>
                <div className="flex gap-2 w-full">
                    <div>
                        <label>X</label>
                        <input className="w-full" type="number" name="backgroundPosition.x" placeholder="X" defaultValue={0} />
                    </div>
                    <div>
                        <label>Y</label>
                        <input className="w-full" type="number" name="backgroundPosition.y" placeholder="Y" defaultValue={0} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <label>Image Size</label>
                <div className="flex gap-2 w-full">
                    <div>
                        <label>Width</label>
                        <input className="w-full" type="number" name="backgroundSize.h" placeholder="W" defaultValue={0} />
                    </div>
                    <div>
                        <label>Height</label>
                        <input className="w-full" type="number" name="backgroundSize.w" placeholder="H" defaultValue={0} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <h1>Entities</h1>

                <ul className="max-h-52 mb-2">
                    <li>
                        <input className="hidden" name="entity" value="" />
                        <div className="flex gap-2">
                            <div className="h-6 w-6 relative">
                                <img className="h-full w-full object-cover" src="" alt="Entity Icon" />
                            </div>
                            <div className="flex justify-between">
                                <h1>Entity Name</h1>

                                <button type="button">Del</button>
                            </div>
                        </div>
                        <div>
                            <input type="number" placeholder="x" name={"entity.ENTITY_ID.x"} defaultValue={0} />
                            <input type="number" placeholder="y" name={"entity.ENTITY_ID.y"} defaultValue={0} />
                        </div>
                    </li>
                </ul>

                <div className="flex justify-end">
                    <button type="button">Add Entity</button>
                </div>
            </div>


            <div className="flex w-full">
                <div className="flex flex-col w-full">
                    <label>Prev Stage</label>
                    <select>

                    </select>
                </div>
                <div className="flex flex-col w-full">
                    <label>Next Stage</label>
                    <select>

                    </select>
                </div>
            </div>


            <div className="flex flex-col">
                <label>Stage Group</label>
                <select>

                </select>
            </div>


            <div className="flex justify-end">
                <button type="submit">Save</button>
            </div>
        </form>
    );
}