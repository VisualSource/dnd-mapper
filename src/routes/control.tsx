import { createFileRoute } from '@tanstack/react-router'
import { Window } from "@tauri-apps/api/window";
import { emitTo } from "@tauri-apps/api/event";
import { useReducer, useRef } from 'react';
import { AddEntityDialog } from '../components/controls/AddEntityDialog';
import type { Entity } from '../lib/types';

const win = new Window("display");


type State = {
  units: Entity[]
  round: number,
  index: number;
}

const reducer = (state: State, ev: { type: "set-state", data: State }) => {
  switch (ev.type) {
    case "set-state": {
      return ev.data;
    }
    default:
      return state;
  }
}

const DEFAULT_STATE = {
  units: [
    { id: "a", image: "", initiative: 0, name: "Temp Name", health: 100, maxHealth: 100, tempHealth: 12, isPlayerControlled: false } as Entity,
    { id: "b", image: "", initiative: 0, name: "Temp2 Name", health: 50, maxHealth: 50, tempHealth: 0, isPlayerControlled: false },
    { id: "c", image: "", initiative: 0, name: "Temp3 Name", health: 44, maxHealth: 50, tempHealth: 0, isPlayerControlled: false }
  ], round: 0, index: 0
};

const ControlPanel: React.FC = () => {
  const addEntityDialogRef = useRef<{ show: () => void, hide: () => void }>(null);
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  return (
    <div className='flex w-full'>
      <AddEntityDialog ref={addEntityDialogRef} onClose={(items) => {
        addEntityDialogRef.current?.hide();

        state.units.push(...items);
        state.units.sort((a, b) => b.initiative - a.initiative);

        dispatch({ type: "set-state", data: { ...state } });
      }} />
      <dialog id="unit-control">
        <div className='flex flex-col p-2 gap-2'>
          <div className='flex justify-between'>
            <h1>Edit Entity</h1>
            <button type="button" onClick={() => (document.getElementById("unit-control") as HTMLDialogElement).close()}>Close</button>
          </div>
          <form className="border" onSubmit={(ev) => {
            ev.preventDefault();
            const data = new FormData(ev.target as HTMLFormElement);

            emitTo("display", "move-player", {
              target: "TEST_ID",
              move: {
                x: Number.parseInt(data.get("x")?.toString() ?? "0"),
                y: Number.parseInt(data.get("y")?.toString() ?? "0")
              }
            });
          }}>
            <div className='flex flex-col gap-4'>
              <h1>Movement</h1>

              <input required name="initiative" type="number" placeholder="Initiative" />

              <div className='flex'>
                <label>
                  X: <input placeholder='x' type="number" name="x" />
                </label>
                <label>
                  Y: <input placeholder='y' type="number" name="y" />
                </label>
              </div>

              <button type="submit">Move</button>
            </div>
          </form>

          <form className="border p-2" onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const amount = data.get("health_mod");
            const type = data.get("health_type");

            console.log(amount, type);

          }}>
            <div className='flex justify-center'>
              <h1>HP: 100</h1>
            </div>
            <div className='flex gap-2 justify-center'>
              <label className='flex items-center align-middle gap-1'>
                <input type="radio" name="health_type" defaultValue="damage" />
                Damage
              </label>
              <label className='flex items-center align-middle gap-1'>
                <input type="radio" name="health_type" defaultValue="heal" />
                Heal
              </label>
              <label className='flex items-center align-middle gap-1'>
                <input type="radio" name="health_type" defaultValue="temp" />
                Temp HP
              </label>
            </div>

            <div className='flex flex-col items-center'>
              <input name="health_mod" placeholder='amount' type="number" />
              <button type="submit">Apply</button>
            </div>
          </form>

          <form>
            <label className='flex items-center align-middle gap-1'>
              IsDead
              <input type="checkbox" />
            </label>
            <p className="text-gray-400">(hides unit from board)</p>

          </form>
        </div>

      </dialog>
      <section className='w-full border-r p-2'>
        <header>
          <h1>Round {state.round}</h1>
          <button type="button" className='border text-white' onClick={() => {
            const first = state.units.shift();
            const units: Entity[] = state.units;
            if (first) {
              units.push(first);
            }
            state.index++;
            if (state.index >= units.length) {
              state.round++;
              state.index = 0;
            }

            dispatch({ type: "set-state", data: { ...state, units } })
          }}>Next Round</button>
          <button type="button" className='border text-white'>Clear</button>
        </header>
        <ul className="space-y-4">
          {state.units.map((e, i) => (
            <li key={e.id} className={`bg-gray-500 ${i === 0 ? "shadow shadow-yellow-400 ml-6" : ""}`}>
              <button type="button" className="w-full items-start" onClick={() => (document.getElementById("unit-control") as HTMLDialogElement).showModal()}>
                <h1>{e.name}</h1>
                <div>
                  <span>HP: {e.health + e.tempHealth}/{e.maxHealth}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>

      </section>
      <section className='w-full p-2'>
        <div>
          <h1>Window Controls</h1>
          <button type="button" onClick={async () => {
            const vis = await win.isVisible();
            if (!vis) {
              win.show();
            } else {
              win.hide();
            }
          }}>Toggle Display</button>
        </div>

        <div>
          <h1>Stage</h1>
          <button onClick={() => addEntityDialogRef.current?.show()} type="button">Add Entity</button>
          {/** Will move to stage in the list */}
          <button type="button">Next Stage</button>
          <form>
            <input placeholder='Stage' type="number" />
            {/** Will move to stage in the list */}
            <button type="button">GoTo Stage</button>
          </form>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute('/control')({
  component: ControlPanel
})