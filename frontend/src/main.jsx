import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Global Axios GET Cache for 5 minutes
const CACHE_TIME = 5 * 60 * 1000;
axios.interceptors.request.use((config) => {
  if (config.method === 'get') {
    const url = config.url || '';
    // Chỉ cache các API public nặng
    if (url.includes('/books') || url.includes('/categories') || url.includes('/banners') || url.includes('/settings')) {
      const cached = sessionStorage.getItem(url);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TIME) {
            // Trả về thẳng data từ cache, không gọi mạng
            config.adapter = () => Promise.resolve({
              data,
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
              request: {}
            });
          } else {
            sessionStorage.removeItem(url);
          }
        } catch (e) {
          sessionStorage.removeItem(url);
        }
      }
    }
  }
  return config;
});

axios.interceptors.response.use((response) => {
  if (response.config.method === 'get') {
    const url = response.config.url || '';
    if (url.includes('/books') || url.includes('/categories') || url.includes('/banners') || url.includes('/settings')) {
      sessionStorage.setItem(url, JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));
    }
  }
  return response;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
