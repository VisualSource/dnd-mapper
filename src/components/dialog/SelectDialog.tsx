import { forwardRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Dialog, type DialogHandle } from "../Dialog";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export const SelectDialog = forwardRef<DialogHandle, {
    modArg?: (arg: unknown) => unknown,
    eventName: string,
    options: { description?: string; name: string, value: string }[],
    searchText: string;
    notFoundText: string;
    title: string;
}>(({ modArg, eventName, options, notFoundText, searchText, title }, ref) => {
    const [value, setValue] = useState<string | null>(null);
    return (
        <Dialog ref={ref} onClose={(arg) => {
            window.dispatchEvent(new CustomEvent(eventName, { detail: modArg ? modArg(arg) : arg }));
        }}>
            {(({ close }: { close: (...args: unknown[]) => void }) => (
                <>
                    <header className="flex flex-col border-b p-1 sticky top-0 bg-background">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="font-semibold ml-2">{title}</h1>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    type="button"
                                    onClick={() => close(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </header>
                    <main>
                        <Command>
                            <CommandInput placeholder={searchText} />
                            <CommandList>
                                <CommandEmpty>{notFoundText}</CommandEmpty>
                                <CommandGroup className="space-y-2">
                                    {options.map((item) => (
                                        <CommandItem onSelect={() => setValue(prev => {
                                            if (prev === item.value) return null;
                                            return item.value;
                                        })} key={item.value} value={item.value}>
                                            <Check className={cn("mr-2", { "opacity-0": value !== item.value })} />
                                            <div className="flex flex-col">
                                                <h4 className="font-bold">{item.name}</h4>
                                                {item?.description ? (<p className="text-muted-foreground">{item.description}</p>) : null}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </main>
                    <div className="flex justify-end p-2">
                        <Button type="button" variant="secondary" onClick={() => close(value)}>Ok</Button>
                    </div>
                </>
            )) as never}
        </Dialog>
    );
})