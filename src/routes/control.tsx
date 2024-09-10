import { createFileRoute } from '@tanstack/react-router'
import { Window } from "@tauri-apps/api/window";
import { emitTo } from "@tauri-apps/api/event";
import { useReducer } from 'react';

const win = new Window("display");

type Entity = { id: string, name: string; health: number, max_health: number, temp_health: number, isPlayer: boolean };
type State = {
  units: Entity[]
  round: number,
  index: number;
}

const reducer = (state: State, ev: { type: string }) => {
  switch (ev.type) {
    case "next": {
      console.log("NExt");
      break;
      /*const first = state.units.shift();
      const units: Entity[] = state.units;
      if (first) {
        units.push(first);
      }
      console.log(units);

      state.index++;

      console.log("INDEX", state.index)

      if (state.index >= (units.length - 1)) {
        state.round++;
        state.index = 0;
      }
      return { ...state, units };*/
    }

    default:
      break;
  }

  return state;
}

const DEFAULT_STATE = {
  units: [
    { id: "a", name: "Temp Name", health: 100, max_health: 100, temp_health: 12, isPlayer: false },
    { id: "b", name: "Temp2 Name", health: 50, max_health: 50, temp_health: 0, isPlayer: false },
    { id: "c", name: "Temp3 Name", health: 44, max_health: 50, temp_health: 0, isPlayer: false }
  ], round: 0, index: 0
};

const ControlPanel: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  return (
    <div className='flex w-full'>
      <section className='w-full border-r p-2'>
        <header>
          <h1>Round {state.round}</h1>
          <button type="button" className='border text-white' onClick={() => dispatch({ type: "next" })}>Next Round</button>
          <button type="button" className='border text-white'>Clear</button>
        </header>
        <ul className="space-y-4">
          {state.units.map((e, i) => (
            <li key={e.id} className={`bg-gray-500 ${i === 0 ? "shadow shadow-yellow-400 ml-6" : ""}`}>
              <h1>{e.name}</h1>
              <div>
                <span>HP: {e.health + e.temp_health}/{e.max_health}</span>
              </div>
            </li>
          ))}
        </ul>

      </section>
      <section className='w-full p-2'>
        <button type="button" onClick={async () => {
          const vis = await win.isVisible();
          if (!vis) {
            win.show();
          }
        }}>Show Display</button>

        <button type="button" onClick={async () => {
          win.hide();
        }}>
          Hide
        </button>

        <form onSubmit={(ev) => {
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
          <label>
            X: <input placeholder='x' type="number" name="x" />
          </label>
          <label>
            Y: <input placeholder='y' type="number" name="y" />
          </label>
          <button type="submit">Update</button>
        </form>
      </section>
    </div>
  );
}

export const Route = createFileRoute('/control')({
  component: ControlPanel
})