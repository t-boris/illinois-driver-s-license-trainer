import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Content drafts and generated images change outside the editor (scripts patch them); reloading the page on each
  // change would reset a quiz in progress. Reload manually after editing them.
  server: { watch: { ignored: ['**/content-drafts/**', '**/public/images/**'] } },
})
