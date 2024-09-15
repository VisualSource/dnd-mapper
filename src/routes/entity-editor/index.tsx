import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/entity-editor/')({
  component: () => (
    <div className='h-full w-full flex justify-center items-center'>
      <p>Create a new entity or edit a existing one.</p>
    </div>
  )
})