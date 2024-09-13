import { createFileRoute, Link } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { useState } from 'react';
import { AddEntityForm } from '../components/AddEntityForm';
import { confirm } from '@tauri-apps/plugin-dialog';
import { useDebounce } from 'use-debounce';

const EntityList: React.FC<{ filter?: string, onClick: (id: string) => void }> = ({ onClick, filter }) => {
  const data = useLiveQuery(() => {
    if (!filter) {
      return db.entity.toArray();
    }
    return db.entity.where("name").startsWith(filter).toArray()
  }, [filter], [])

  if (data === undefined) {
    return (<div className='w-full h-full flex justify-center items-center'>Loading Entitites</div>);
  }

  return (
    <ul className='p-2 space-y-2 overflow-y-scroll h-full' onClick={(ev) => {
      const item = (ev.nativeEvent.target as HTMLElement).closest("li[data-id]");
      if (!item) return;
      const id = item.getAttribute("data-id");
      if (!id) return;
      onClick(id);
    }} onKeyUp={() => { }} onKeyDown={() => { }}>
      {data.length > 0 ? data.map(e => (
        <li key={e.id} className='flex w-full bg-gray-700 shadow' data-id={e.id}>
          <button type="button" className='flex gap-2 w-full p-2'>
            <div className="h-12 w-12 relative">
              <img src={e.image} alt={e.name} className="h-full w-full object-cover" />
            </div>
            <div className='flex flex-col'>
              <h1 className="text-left">{e.name}</h1>
              <p className="text-sm">Initiative: {e.initiative}</p>
            </div>
          </button>
        </li>
      )) : (
        <li>
          No Entities
        </li>
      )}
    </ul>
  );
}

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
        <EntityList onClick={(id) => setShowEntity(id)} filter={query} />
      </aside>
    </div>
  );
}

export const Route = createFileRoute('/entity-editor')({
  component: EntityEditorPage
})