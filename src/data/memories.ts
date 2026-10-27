export type MemoryItem = {
  caption: string;
  landscape: boolean;
  date: string;
  src?: string;
  tone: string;
};

const tones = [
  "#ff8f5b",
  "#f6c86f",
  "#79dfca",
  "#ff5d8f",
  "#a3b7ff",
  "#ffd8b8",
  "#8dd6ff",
  "#ffaf8f",
  "#ffe39d",
  "#8ee1cf",
  "#ff88b0",
  "#e8d7ff",
  "#b8f2d0",
  "#ffc6dd",
];

const photoSources = [
  "/photos/optimized/photo-01.jpg",
  "/photos/optimized/photo-02.jpg",
  "/photos/optimized/photo-03.jpg",
  "/photos/optimized/photo-04.jpg",
  "/photos/optimized/photo-05.jpg",
  "/photos/optimized/photo-06.jpg",
  "/photos/optimized/photo-07.jpg",
  "/photos/optimized/photo-08.jpg",
  "/photos/optimized/photo-09.jpg",
  "/photos/optimized/photo-10.jpg",
  "/photos/optimized/photo-11.jpg",
  "/photos/optimized/photo-12.jpg",
  "/photos/optimized/photo-13.jpeg",
  "/photos/optimized/photo-14.jpeg",
  "/photos/optimized/photo-15.png",
  "/photos/optimized/photo-16.jpg",
  "/photos/optimized/photo-17.jpg",
  "/photos/optimized/photo-18.png",
  "/photos/optimized/photo-19.jpeg",
  "/photos/optimized/photo-20.jpeg",
  "/photos/optimized/photo-21.jpeg",
  "/photos/optimized/photo-22.jpg",
  "/photos/optimized/photo-23.jpeg",
  "/photos/optimized/photo-24.jpg",
  "/photos/optimized/photo-25.jpeg",
  "/photos/optimized/photo-26.png",
  "/photos/optimized/photo-27.jpg",
  "/photos/optimized/photo-28.jpg",
];

// Fotos horizontales (el resto son verticales), para mostrarlas sin recortar de mas.
const landscapeIndexes = new Set([12, 13, 18, 19, 22, 24]);

// Fotos que no se muestran en la historia (de lado, sin caras, etc.). Numero de foto, empezando en 1.
const skippedPhotos = new Set([1, 4, 6, 7, 8, 11, 14, 15, 27]);

const allMemories: MemoryItem[] = photoSources.map((src, index) => ({
  caption: `Recuerdo ${index + 1}`,
  landscape: landscapeIndexes.has(index),
  date: index < 6 ? "2022" : index < 14 ? "2023" : index < 22 ? "2024" : "2025",
  src,
  tone: tones[index % tones.length],
}));

export const memories: MemoryItem[] = allMemories.filter(
  (_, index) => !skippedPhotos.has(index + 1),
);
