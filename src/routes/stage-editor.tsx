import { createFileRoute, Link } from '@tanstack/react-router'

import { useState } from 'react';
import { StageList } from '../components/editor/StageList';
import { useDebounce } from 'use-debounce';
import { StageGroupSelect } from '../components/editor/StageGroupSelect';
import { StageForm } from '../components/editor/StageForm';
import { confirm } from '@tauri-apps/plugin-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

const DisplayExiting: React.FC<{ id: string }> = ({ id }) => {
  const stage = useLiveQuery(() => db.stage.get(id), [id], null);

  if (stage === undefined) return (<div>Loading</div>);
  if (stage === null) return (<div>Not Found</div>);

  return <StageForm stage={stage} />
}

const CreateStagePage: React.FC = () => {
  const [view, setView] = useState<string | "NEW_STAGE" | null>(null);
  const [group, setGroup] = useState<string>();
  const [search, setSearch] = useState<string>();
  const [query] = useDebounce(search, 1000);

  return (
    <div className='flex w-full'>
      <main className="overflow-hidden w-7/12 flex flex-col">
        <header className='flex'>
          <Link to="/">Back</Link>
          {view && view !== "NEW_STAGE" ? (<button type="button" onClick={async () => {
            const confirmed = await confirm("Are you sure?", { title: "Delete Stage", kind: "warning" });
            if (!confirmed) return;
            await db.stage.delete(view);
            setView(null);
          }}>Del</button>) : null}
        </header>
        {!view ? (
          <div>
            Select stage or create new stage.
          </div>
        ) : view === "NEW_STAGE" ? (
          <StageForm />
        ) : (
          <DisplayExiting id={view} />
        )}
      </main>
      <aside className="flex flex-col overflow-hidden w-5/12">
        <header className='flex w-full'>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Serach' type="search" />
          <StageGroupSelect onSelect={setGroup} value={group} />
          <button type="button" onClick={() => setView("NEW_STAGE")}>New</button>
        </header>
        <StageList filter={query} />
      </aside>
    </div>
  );
}

export const Route = createFileRoute('/stage-editor')({
  component: CreateStagePage
})