export default function AudioVisualizer() {
  return (
    <div className="flex items-end justify-center gap-1 h-24">
      {Array.from({ length: 32 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-yellow/60 rounded-full animate-pulse"
          style={{
            height: `${Math.random() * 80 + 20}%`,
            animationDelay: `${i * 0.05}s`,
            animationDuration: `${Math.random() * 0.5 + 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
