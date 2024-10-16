import { cn } from "@/lib/utils";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export type DialogHandle = {
    show: (...args: unknown[]) => void,
    close: (...args: unknown[]) => void
};

export const Dialog = forwardRef<DialogHandle, React.PropsWithChildren<{
    className?: string,
    onClose?: (...args: unknown[]) => void,
    onOpen?: (...args: unknown[]) => void
}>>(({ children, className, onClose, onOpen }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const close = useCallback((...args: unknown[]) => {
        dialogRef.current?.close();
        onClose?.call(this, ...args);
    }, [onClose]);
    useImperativeHandle(ref, () => {
        return {
            show(...args: unknown[]) {
                dialogRef.current?.showModal();
                onOpen?.call(this, ...args);
            },
            close,
        }
    });
    return (
        <dialog ref={dialogRef} className={cn("bg-background text-foreground backdrop:opacity-70 backdrop:bg-gray-600 shadow-md w-96", className)}>
            {typeof children === "function" ? (children as (props: { close: () => void }) => React.ReactElement)({ close }) : children}
        </dialog>
    );
})