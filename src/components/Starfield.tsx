import type { CSSProperties } from "react";

const stars = Array.from({ length: 46 }, (_, index) => ({
  x: (index * 61) % 100,
  y: (index * 37 + 13) % 100,
  size: 1 + (index % 3),
  delay: (index * 0.37) % 5,
  duration: 2.5 + (index % 4),
}));

const hearts = Array.from({ length: 7 }, (_, index) => ({
  x: (index * 17 + 6) % 94,
  size: 0.9 + (index % 3) * 0.35,
  delay: -index * 5.5,
  duration: 26 + (index % 4) * 5,
}));

// Fondo fijo: estrellas que titilan y corazones que suben despacio por detras del contenido.
export default function Starfield() {
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          className="star"
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            } as CSSProperties
          }
        />
      ))}
      {hearts.map((heart, index) => (
        <span
          key={`h${index}`}
          className="float-heart"
          style={
            {
              left: `${heart.x}%`,
              fontSize: `${heart.size}rem`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
            } as CSSProperties
          }
        >
          ♥
        </span>
      ))}
    </div>
  );
}
