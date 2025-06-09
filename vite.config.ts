import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), TanStackRouterVite({ target: 'react', autoCodeSplitting: true, generatedRouteTree: './src/lib/route-tree.gen.ts' }), react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
