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
    <div className='flex h-full'>
      <EntityControlDialog ref={ecDialogRef} queue={queue} setQueue={setQueue} />
      <StageSelectionDialog ref={ssdialogRef} onSelect={(id) => navigate({ to: "/control/$id", params: { id } })} />
      <AdditionEntityDialog ref={aedialogRef} onAdd={async (entity) => {
        const data = { entity: { ...entity }, instanceId: crypto.randomUUID(), y: 0, x: 0 };
        await emitTo(MAP_WINDOW_LABEL, DISPLAY_MAP_EVENTS.Add, data);
        setQueue(prev => [...prev, data]);
      }} />
      <section>
        <header>
          <h3>Round {round}</h3>
          <button type="button" onClick={() => {
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
          }}>Next</button>
        </header>
        <ul onClick={(ev) => {
          const target = (ev.nativeEvent.target as HTMLElement).closest("li[data-id]")
          if (!target) return;
          const id = target.getAttribute("data-id");
          if (!id) return;
          ecDialogRef.current?.show(id);
        }} onKeyUp={() => { }} onKeyDown={() => { }}>
          {queue.map(e => (
            <li key={e.instanceId} data-id={e.instanceId}>
              <button type="button" className='flex'>
                <div className="h-12 w-12 relative">
                  <img className="h-full w-full object-cover" src={e.entity.image} alt={e.entity.name} />
                </div>
                <div>
                  <h5>{e.nameOverride ?? e.entity.name} | {e.entity.initiative}</h5>
                  {!e.entity.isPlayerControlled ? (<div>{e.entity.health + e.entity.tempHealth}/{e.entity.maxHealth}</div>) : null}
                </div>

              </button>
            </li>
          ))}
        </ul>
      </section>
      <aside>
        <h1>Stage</h1>
        <p>{stage.name}</p>

        <div>
          <button type="button" onClick={displayWindowToggle}>Toggle Map Window</button>
          <Link to="/">Exit</Link>
        </div>

        <button type="button" onClick={() => aedialogRef.current?.show()}>Add Entity</button>
        <button type="button" onClick={() => setQueue(e => {
          e.sort((a, b) => b.entity.initiative - a.entity.initiative);
          return [...e];
        })}>Sort Initiative</button>

        <div>
          <Link disabled to="/control/$id" params={{ id: stage.prevStage ?? "" }}>Prev Stage</Link>
          <Link disabled to="/control/$id" params={{ id: stage.nextStage ?? "" }}>Next Stage</Link>
        </div>
        <button type="button" onClick={() => ssdialogRef.current?.show()}>Goto Stage</button>
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