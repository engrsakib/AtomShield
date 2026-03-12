// src/app/dashboard/youtube/page.tsx
export default function YoutubePage() {
  const videos = [
    "https://www.youtube.com/embed/ysz5S6PUM-U",
    "https://www.youtube.com/embed/E7wJTI-1dvQ",
  ];
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">YouTube Tutorials</h2>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {videos.map((v, i) => (
          <iframe
            key={i}
            className="w-full aspect-video rounded-xl shadow-md"
            src={v}
            allowFullScreen
          ></iframe>
        ))}
      </div>
    </div>
  );
}
