import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageSelect } from "./ImageSelect";
import type { Entity } from "../lib/types";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const AddEntityForm: React.FC<{ btnMsg?: string, resetOnSubmit?: boolean, onSubmit: (entity: Entity) => void, entity?: Entity }> = ({ onSubmit, entity, btnMsg = "Ok" }) => {
    const form = useForm({
        defaultValues: entity ?? {
            id: crypto.randomUUID(),
            displayOnMap: true,
            isPlayerControlled: false,
            health: 100,
            maxHealth: 100,
            tempHealth: 0,
            image: "",
            puckSize: "small",
            initiative: 0,
            name: "",
        }
    });

    const isPlayerControlled = form.watch("isPlayerControlled");

    return (
        <Form {...form}>
            <form className="w-full h-full p-2 flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField control={form.control} rules={{
                    required: { message: "A name is required", value: true },
                    maxLength: { message: "Max name length is 256 characters", value: 256 },
                    minLength: { message: "Name must be more then 3 characters", value: 3 }
                }} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Jimmy" />
                        </FormControl>
                        <FormDescription>
                            A name to discribe the entity
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="image" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                            <ImageSelect onChange={(url) => field.onChange(url)} value={field.value} />
                        </FormControl>
                        <FormDescription>
                            A image to represent this entity on the board.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} rules={{
                    required: { message: "A initiative value is required", value: true },
                }} name="initiative" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Initiative</FormLabel>
                        <FormControl>
                            <Input {...field} onChange={e => field.onChange(e.target.valueAsNumber)} type="number" />
                        </FormControl>
                        <FormDescription>
                            The priority in execution queue.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} rules={{
                    required: { message: "A puck size is required", value: true }
                }} name="puckSize" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Puck Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Puck Size" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="small">Small (1 cell)</SelectItem>
                                <SelectItem value="mid">Medium (4 cells)</SelectItem>
                                <SelectItem value="large">Large (9 cells)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Controls how many grid cells this entity will take up.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="displayOnMap" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Display On Map</FormLabel>
                            <FormDescription>

                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField control={form.control} name="isPlayerControlled" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Is Player Controlled</FormLabel>
                            <FormDescription>
                                Health values will be managed by a player.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )} />

                {!isPlayerControlled ? (
                    <div className="flex flex-col gap-2 animate-in fade-in-5">
                        <FormField control={form.control} rules={{
                            required: { message: "A health value is required", value: true },
                        }} name="health" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Health</FormLabel>
                                <FormControl>
                                    <Input {...field} onChange={e => field.onChange(e.target.valueAsNumber)} type="number" />
                                </FormControl>
                                <FormDescription>
                                    The health of the unit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} rules={{
                            required: { message: "A max health value is required", value: true },
                        }} name="maxHealth" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Health</FormLabel>
                                <FormControl>
                                    <Input {...field} onChange={e => field.onChange(e.target.valueAsNumber)} type="number" />
                                </FormControl>
                                <FormDescription>
                                    The max health of the unit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} rules={{
                            required: { message: "A temp health value is required", value: true },
                        }} name="tempHealth" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Health</FormLabel>
                                <FormControl>
                                    <Input {...field} onChange={e => field.onChange(e.target.valueAsNumber)} type="number" />
                                </FormControl>
                                <FormDescription>
                                    The temp health of the unit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                ) : null}

                <div className="flex justify-end pb-2">
                    <Button type="submit">{btnMsg}</Button>
                </div>
            </form>
        </Form>
    );
}