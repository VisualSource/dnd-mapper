import { createFileRoute, Link } from '@tanstack/react-router';
import { confirm } from '@tauri-apps/plugin-dialog';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';
import { EntityList } from '../components/editor/EntityList';
import { AddEntityForm } from '../components/AddEntityForm';
import { db } from '../lib/db';

const DisplayEntity: React.FC<{ id: string, onDelete: () => void, }> = ({ id, onDelete }) => {
  const entity = useLiveQuery(() => db.entity.get(id), [id], null);

  if (entity === undefined) {
    return (<div>Loading Entity...</div>)
  }

  if (entity === null) return (
    <div>No Entity Found</div>
  )

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <header className='flex justify-end'>
        <button type="button" onClick={async () => {
          const confirmed = await confirm('Are you sure?', { title: `Delete ${entity.name}`, kind: "warning" });
          if (!confirmed) return;
          await db.entity.delete(id);
          onDelete();
        }}>Delete</button>
      </header>
      <AddEntityForm entity={entity} onSubmit={(ev) => db.entity.update(id, ev)} resetOnSubmit={false} btnMsg='Save' />
    </div>
  );
}

const EntityEditorPage: React.FC = () => {
  const [search, setSearch] = useState<string>();
  const [query] = useDebounce(search, 1000);
  const [showEntity, setShowEntity] = useState<null | string | "NEW-ENTITY">(null);
  return (
    <div className='flex w-full overflow-hidden'>
      <main className='w-7/12 h-full border-r'>
        <header className='py-1 px-2'>
          <Link to="/">Back</Link>
        </header>

        {!showEntity ? (
          <div className='h-full w-full flex justify-center items-center'>
            <p>Create a new entity or edit a existing one.</p>
          </div>
        ) : showEntity === "NEW-ENTITY" ? (
          <AddEntityForm onSubmit={async (entity) => {
            await db.entity.add(entity);
            setShowEntity(entity.id);
          }} resetOnSubmit={false} btnMsg='Save' />
        ) : (<DisplayEntity id={showEntity} onDelete={() => setShowEntity(null)} />)}
      </main>
      <aside className="flex flex-col w-5/12 overflow-hidden">
        <header className='flex justify-between'>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Serach' type="search" />
          <button type="button" onClick={() => setShowEntity("NEW-ENTITY")}>New</button>
        </header>
        <EntityList deletable onClick={(entity) => setShowEntity(entity.id)} filter={query} />
      </aside>
    </div>
  );
}

export const Route = createFileRoute('/entity-editor')({
  component: EntityEditorPage
})