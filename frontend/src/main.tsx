import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import App from "./App.tsx";
import "./index.css";

// إعداد React Query مع caching ذكي
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // البيانات تبقى "طازجة" لمدة 5 دقائق
      gcTime: 10 * 60 * 1000, // الاحتفاظ بالـ cache لمدة 10 دقائق
      refetchOnWindowFocus: false, // عدم إعادة الجلب عند التركيز على النافذة
      retry: 1, // محاولة واحدة فقط عند الفشل
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
