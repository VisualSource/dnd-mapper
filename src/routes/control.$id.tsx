import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { getCurrentWindow } from "@tauri-apps/api/window";
import { emitTo } from "@tauri-apps/api/event";
import { useRef, useState } from 'react';


import { StageSelectionDialog, type StageSelectionDialogHandle } from '../components/dialog/StageSelectionDialog';
import { AdditionEntityDialog } from '../components/dialog/AdditionEntityDialog';
import { DISPLAY_MAP_EVENTS, MAP_WINDOW_LABEL } from '../lib/consts';
import { resloveStage } from '../lib/loader';
import { EntityControlDialog, type EntityControlDialogHandle } from '../components/dialog/EntityControlDialog';
import { displayWindow, displayWindowToggle } from '../lib/window';
import { Separator } from '@/components/ui/separator';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileQuestion } from 'lucide-react';


const ControlPanel: React.FC = () => {
  const stage = Route.useLoaderData();
  const [queue, setQueue] = useState(stage.entities);
  const [round, setRound] = useState<number>(1);
  const [currentEntity, setCurrentEntity] = useState(0);
  const navigate = useNavigate();
  const ssdialogRef = useRef<StageSelectionDialogHandle>(null);
  const aedialogRef = useRef<StageSelectionDialogHandle>(null);
  const ecDialogRef = useRef<EntityControlDialogHandle>(null);

  return (
    <div className='flex h-full w-full'>
      <EntityControlDialog ref={ecDialogRef} queue={queue} setQueue={setQueue} />
      <StageSelectionDialog ref={ssdialogRef} onSelect={(id) => navigate({ to: "/control/$id", params: { id } })} />
      <AdditionEntityDialog ref={aedialogRef} onAdd={async (entity) => {
        const data = { entity: { ...entity }, instanceId: crypto.randomUUID(), y: 0, x: 0 };
        await emitTo(MAP_WINDOW_LABEL, DISPLAY_MAP_EVENTS.Add, data);
        setQueue(prev => [...prev, data]);
      }} />
      <section className="w-8/12 flex flex-col border-r">
        <header className='flex justify-between p-2'>
          <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>Round <span className="text-muted-foreground">{round}</span></h3>
          <Button type="button" size="sm" onClick={() => {
            const temp = queue;
            const len = temp.length;
            const first = temp.shift();
            if (first) {
              setQueue([...temp, first]);
            }
            if (currentEntity + 1 < len) {
              setCurrentEntity(prev => prev + 1);
            } else {
              setCurrentEntity(0);
              setRound(e => e + 1);
            }
          }}>Next</Button>
        </header>
        <Separator />
        <ul className="space-y-2 p-2" onClick={(ev) => {
          const target = (ev.nativeEvent.target as HTMLElement).closest("li[data-id]")
          if (!target) return;
          const id = target.getAttribute("data-id");
          if (!id) return;
          const entity = queue.find(e => e.instanceId === id)
          if (!entity) return;
          ecDialogRef.current?.show(entity);
        }} onKeyUp={() => { }} onKeyDown={() => { }}>
          {queue.map((e, i) => (
            <li key={e.instanceId} data-id={e.instanceId} className={cn("p-2 border rounded-sm", { "opacity-35": !e.entity.displayOnMap, "bg-zinc-900": e.entity.displayOnMap && i === 0 })}>
              <button type="button" className='flex gap-2'>
                <Avatar>
                  <AvatarFallback>
                    <FileQuestion />
                  </AvatarFallback>
                  <AvatarImage src={e.entity.image} alt={e.entity.name} />
                </Avatar>
                <div>
                  <h5 className='font-semibold tracking-tight'>{e?.nameOverride?.length ? e.nameOverride : e.entity.name} | Initiative {e.entity.initiative}</h5>
                  {!e.entity.isPlayerControlled ? (<div className="text-muted-foreground text-left">Health: <span className={cn({ "text-blue-400": e.entity.tempHealth > 0 })}>{e.entity.health + e.entity.tempHealth}</span>/{e.entity.maxHealth}</div>) : <div className="text-muted-foreground text-left">Player Controlled</div>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <aside className='w-4/12 flex flex-col gap-4 p-2'>
        <div>
          <h1 className='scroll-m-20 text-2xl font-semibold tracking-tight'>Stage</h1>
          <p>{stage.name}</p>
        </div>

        <Separator />

        <div className='flex w-full gap-2'>
          <Button type="button" onClick={displayWindowToggle}>Toggle Map Window</Button>
          <Link className={cn(buttonVariants({ variant: "secondary" }), "w-full")} to="/">Exit</Link>
        </div>

        <Separator />

        <div className='flex gap-2 w-full'>
          <Button type="button" variant="outline" className='w-full' onClick={() => aedialogRef.current?.show()}>Add Entity</Button>
          <Button type="button" variant="outline" className='w-full' onClick={() => setQueue(e => {
            e.sort((a, b) => b.entity.initiative - a.entity.initiative);
            return [...e];
          })}>Sort Initiative</Button>
        </div>

        <Separator />

        <div className='flex gap-2'>
          <Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} disabled to="/control/$id" params={{ id: stage.prevStage ?? "" }}>Prev Stage</Link>
          <Link className={cn(buttonVariants({ variant: "outline" }), "w-full")} disabled to="/control/$id" params={{ id: stage.nextStage ?? "" }}>Next Stage</Link>
        </div>
        <Button type="button" variant="secondary" onClick={() => ssdialogRef.current?.show()}>Goto Stage</Button>
      </aside>
    </div>
  );
}

export const Route = createFileRoute('/control/$id')({
  component: ControlPanel,
  async loader(ctx) {
    const content = await resloveStage(ctx.params.id);
    if (!content) throw new Error("No stage found!");
    return content;
  },
  async onEnter(ctx) {
    const visible = await displayWindow.isVisible();
    await emitTo(MAP_WINDOW_LABEL, DISPLAY_MAP_EVENTS.Init, ctx.loaderData);
    await getCurrentWindow().setTitle(`DnD Mapper | ${ctx.loaderData?.name}`);
    if (!visible) await displayWindow.show();
  },
  onLeave() {
    getCurrentWindow().setTitle("DnD Mapper");
    displayWindow.hide();
  }
})