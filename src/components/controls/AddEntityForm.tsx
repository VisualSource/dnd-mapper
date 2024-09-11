import { useState } from "react";

export const AddEntityForm: React.FC<{ onSubmit?: (ev: React.FormEvent<HTMLFormElement>) => void }> = ({ onSubmit }) => {
    const [show, setShow] = useState(false);

    return (
        <form onSubmit={onSubmit}>
            <input required name="name" placeholder="Name" />
            <input required name="icon" placeholder="Icon" />
            <input required name="initiative" type="number" placeholder="Initiative" />
            <input onChange={(ev) => setShow(ev.currentTarget.checked)} checked={show} name="isPlayerControlled" type="checkbox" />
            {show ? (
                <div>
                    <input required name="health" type="number" placeholder="Health" />
                    <input required name="maxHealth" type="number" placeholder="Max Health" />
                </div>
            ) : null}

            <button type="submit">Add</button>
        </form>
    );
}