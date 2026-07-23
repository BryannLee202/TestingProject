import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: 'window',
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendor libs out of the main entry
        // chunk so a route-level `React.lazy()` page doesn't drag them
        // all in on first paint just because App.jsx imports it eagerly.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('@stomp/stompjs') || id.includes('sockjs-client')) return 'websocket';
          if (id.includes('sweetalert2')) return 'sweetalert2';
          if (id.includes('react-select')) return 'react-select';
          if (id.includes('swiper')) return 'swiper';
          if (id.includes('react-icons')) return 'react-icons';
          if (id.includes('react-router-dom') || id.includes('/react-router/')) return 'react-router';
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler/')) return 'react-vendor';
        },
      },
    },
  },
})
