import { createFileRoute } from '@tanstack/react-router';
import { AddEntityForm } from '@/components/AddEntityForm';
import { useToast } from "@/hooks/use-toast"
import { db } from '@/lib/db';

export const Route = createFileRoute('/entity-editor/new')({
  component: () => {
    const { toast } = useToast();
    const navigate = Route.useNavigate();
    return (
      <AddEntityForm onSubmit={async (entity) => {
        await db.entity.add(entity);
        toast({ title: "Entity Created" });
        navigate({ to: "/entity-editor/$id", params: { id: entity.id } });
      }} resetOnSubmit={false} btnMsg='Save' />
    );
  }
});