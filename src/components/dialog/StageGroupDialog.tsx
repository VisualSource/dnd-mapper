import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { Input } from "../ui/input";
import { db } from "@/lib/db";
import { Label } from "../ui/label";

export type StageGroupDialogHandle = { show: () => void, close: () => void };

export const StageGroupDialog = forwardRef<StageGroupDialogHandle>((_, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [error, setError] = useState<string | null>(null);

    useImperativeHandle(ref, () => {
        return {
            show() {
                dialogRef.current?.showModal();
            },
            close() {
                dialogRef.current?.close();
            },
        }
    }, [])

    return (
        <dialog ref={dialogRef} className="bg-background text-foreground backdrop:opacity-70 backdrop:bg-gray-600 shadow-md">
            <header className="flex border-b p-1 justify-between items-center sticky top-0 bg-background">
                <h1 className="font-semibold ml-2">Add Stage Group</h1>
                <Button variant="ghost" size="sm" type="button" onClick={() => dialogRef.current?.close()}><X className="h-5 w-5" /></Button>
            </header>
            <form className="flex gap-2 p-2 flex-col" onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                const data = new FormData(e.target as HTMLFormElement);
                const value = data.get("name")?.toString();
                if (!value) return;
                try {
                    await db.groups.add({ name: value });
                    (e.target as HTMLFormElement).reset();

                    dialogRef.current?.close();
                } catch (error) {
                    console.error(error);

                    const isConstraint = (error as Error).message.includes("ConstraintError:");

                    if (isConstraint) {
                        setError(`A group with name ${value} already exists!`);
                    } else {
                        setError((error as Error).message);
                    }
                }
            }}>
                <div className="flex flex-col gap-4">
                    <Label>Group Name</Label>
                    <Input placeholder="Group Name" name="name" type="text" minLength={3} maxLength={255} />
                    {error ? (
                        <p className="text-red-600 text-sm">{error}</p>
                    ) : null}
                </div>
                <Button type="submit">Add</Button>
            </form>
        </dialog>
    );
});