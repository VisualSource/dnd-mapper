import { createFileRoute, Link, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { StageList } from '../components/editor/StageList';
import { useDebounce } from 'use-debounce';
import { StageGroupSelect } from '../components/editor/StageGroupSelect';
import { confirm } from '@tauri-apps/plugin-dialog';
import { db } from '../lib/db';
import { editorWindow, toggleEditorWindow } from '../lib/window';

const CreateStagePage: React.FC = () => {
  const matchRoute = useMatchRoute();
  const naviagte = useNavigate();
  const isEditing = matchRoute({ to: "/stage-editor/$id" });
  const [group, setGroup] = useState<string>();
  const [search, setSearch] = useState<string>();
  const [query] = useDebounce(search, 1000);

  return (
    <div className='flex w-full'>
      <main className="overflow-hidden w-7/12 flex flex-col">
        <header className='flex'>
          <Link to="/">Back</Link>

          <button type="button" onClick={toggleEditorWindow}>Show Board</button>

          {isEditing ? (<button type="button" onClick={async () => {
            const confirmed = await confirm("Are you sure?", { title: "Delete Stage", kind: "warning" });
            if (!confirmed) return;
            await db.stage.delete(isEditing.id);
            naviagte({ to: "/stage-editor" });
          }}>Del</button>) : null}
        </header>
        <Outlet />
      </main>
      <aside className="flex flex-col overflow-hidden w-5/12">
        <header className='flex w-full'>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Serach' type="search" />
          <StageGroupSelect onSelect={setGroup} value={group} />
          <Link to="/stage-editor/new">New</Link>
        </header>
        <StageList deletable group={group} filter={query} onClick={(stage) => naviagte({ to: "/stage-editor/$id", params: { id: stage.id } })} />
      </aside>
    </div>
  );
}

export const Route = createFileRoute('/stage-editor')({
  component: CreateStagePage,
  onLeave() {
    editorWindow.hide();
  }
})