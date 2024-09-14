import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stage-editor/')({
  component: () => <div>Select Stage or create new Stage</div>
})