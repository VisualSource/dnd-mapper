import { createFileRoute, Link, Outlet, useMatchRoute } from '@tanstack/react-router';
import { confirm } from '@tauri-apps/plugin-dialog';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';
import { EntityList } from '../components/editor/EntityList';
import { db } from '../lib/db';
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const EntityEditorPage: React.FC = () => {
  const navigate = Route.useNavigate();
  const matchRoute = useMatchRoute();
  const isMatched = matchRoute({ to: "/entity-editor/$id" });

  const [search, setSearch] = useState<string>();
  const [query] = useDebounce(search, 1000);

  return (
    <div className='flex w-full'>
      <main className='w-7/12 h-full border-r flex flex-col'>
        <header className='py-1 px-2 flex items-center justify-between'>
          <Link to="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>Back</Link>
          {isMatched && isMatched.id !== "new" ? (
            <Button variant="destructive" size="sm" type="button" onClick={async () => {
              const confirmed = await confirm('Are you sure?', { title: "Delete Entity", kind: "warning" });
              if (!confirmed) return;
              await db.entity.delete(isMatched.id);
              navigate({ to: "/entity-editor" });
            }}><Trash2 className="h-5 w-5" /></Button>
          ) : null}
        </header>
        <div className="overflow-y-scroll flex flex-col">
          <Outlet />
        </div>
      </main>
      <aside className="flex flex-col w-5/12 overflow-hidden">
        <header className='flex justify-between gap-4 p-2'>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search' type="search" />
          <Link className={buttonVariants({ variant: "secondary" })} to="/entity-editor/new">New</Link>
        </header>
        <Separator />
        <EntityList deletable onClick={(entity) => navigate({ to: "/entity-editor/$id", params: { id: entity.id } })} filter={query} />
      </aside>
    </div>
  );
}

export const Route = createFileRoute('/entity-editor')({
  component: EntityEditorPage
});