export type MemoryItem = {
  caption: string;
  date: string;
  src?: string;
  tone: string;
};

// Reemplaza cada `src` por rutas como `/photos/photo-01.jpg`
// despues de poner tus fotos dentro de `public/photos/`.
export const memories: MemoryItem[] = [
  { caption: "Primera mirada", date: "2022", tone: "#ff8f5b" },
  { caption: "Tu sonrisa favorita", date: "2022", tone: "#f6c86f" },
  { caption: "Primera salida", date: "2023", tone: "#79dfca" },
  { caption: "Modo novios", date: "2023", tone: "#ff5d8f" },
  { caption: "Foto robada", date: "2023", tone: "#a3b7ff" },
  { caption: "Dia random feliz", date: "2024", tone: "#ffd8b8" },
  { caption: "Viaje o paseo", date: "2024", tone: "#8dd6ff" },
  { caption: "Tu version hermosa", date: "2024", tone: "#ffaf8f" },
  { caption: "Recuerdo tierno", date: "2025", tone: "#ffe39d" },
  { caption: "Mi foto top", date: "2025", tone: "#8ee1cf" },
  { caption: "Otra para repetir", date: "2025", tone: "#ff88b0" },
  { caption: "3 anos y 6 meses", date: "2026", tone: "#e8d7ff" },
];
