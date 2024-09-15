import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export const ComboBox: React.FC<{
	container?: Element | null | undefined;
	options?: { id: string; value: string }[];
	defaultValue?: string;
	onSelect: (value: string) => void;
}> = ({ container, defaultValue, onSelect, options }) => {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(defaultValue);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" role="combobox" aria-expanded={open}>
					{value
						? options?.find((e) => e.id === value)?.value
						: "Select Option"}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent container={container} className="p-0">
				<Command>
					<CommandInput placeholder="Search options..." />
					<CommandList>
						<CommandEmpty>No options found.</CommandEmpty>
						<CommandGroup>
							{(options ?? []).map((framework) => (
								<CommandItem
									key={framework.id}
									value={framework.id}
									onSelect={(currentValue) => {
										const id = currentValue === value ? "" : currentValue;
										onSelect(id);
										setValue(id);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === framework.id ? "opacity-100" : "opacity-0",
										)}
									/>
									{framework.value}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
