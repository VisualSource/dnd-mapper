import { forwardRef, useState } from "react";
import { Dialog, type DialogHandle } from "../Dialog";
import { Button } from "../ui/button";
import { Check, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "@/lib/utils";
import { getDefaultTrigger, type Trigger, TRIGGERS } from "@/lib/renderer/actions";

export const TriggerListDialog = forwardRef<DialogHandle>((_, ref) => {
    const [value, setValue] = useState<Trigger["type"] | null>(null);

    return (
        <Dialog ref={ref} onClose={(ev) => {
            window.dispatchEvent(new CustomEvent("dialog::trigger-list", { detail: ev }));
        }}>
            {(({ close }: { close: (...args: unknown[]) => void }) => (
                <>
                    <header className="flex flex-col border-b p-1 sticky top-0 bg-background">
                        <div className="flex justify-between items-center mb-2">
                            <h1 className="font-semibold ml-2">Select Trigger</h1>
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
                            <CommandInput placeholder="Search for triggers...." />
                            <CommandList>
                                <CommandEmpty>No triggers found</CommandEmpty>
                                <CommandGroup className="space-y-2">
                                    {TRIGGERS.map((item) => (
                                        <CommandItem onSelect={() => setValue(prev => {
                                            if (prev === item.id) return null;
                                            return item.id;
                                        })} key={item.id} value={item.name}>
                                            <Check className={cn("mr-2", { "opacity-0": value !== item.id })} />
                                            <div className="flex flex-col">
                                                <h4 className="font-bold">{item.name}</h4>
                                                <p className="text-muted-foreground">{item.description}</p>
                                            </div>
                                        </CommandItem>
                                    ))}

                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </main>
                    <div className="flex justify-end p-2">
                        <Button type="button" variant="secondary" onClick={() => close(getDefaultTrigger(value))
                        }>Ok</Button>
                    </div>
                </>
            )) as never}
        </Dialog>
    )
})