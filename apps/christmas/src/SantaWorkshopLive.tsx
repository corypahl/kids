/** Santa's Workshop uses the YouTube stream requested by the family, with no player API key. */
const SANTA_STREAM = 'https://www.youtube.com/live/KIc_EKADsOI?is=1RUUTcqSgk2KZIS8';
const EMBED = 'https://www.youtube-nocookie.com/embed/KIc_EKADsOI?playsinline=1&rel=0';
export function SantaWorkshopLive() {
  return <section className="santa-workshop-live" aria-label="Santa's Workshop live stream">
    <header className="santa-live-heading">
      <span className="eyebrow">🎅 SANTA’S WORKSHOP</span>
      <h1>See What’s Happening at the North Pole!</h1>
      <p>Peek inside Santa’s workshop. Tap Play to watch the stream.</p>
    </header>
    <div className="santa-video-frame">
      <iframe src={EMBED} title="Santa's Workshop YouTube livestream" allowFullScreen loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"/>
    </div>
    <div className="santa-video-footer">
      <span>🔴 YouTube livestream · Playback and availability are controlled by YouTube.</span>
      <a href={SANTA_STREAM} rel="noopener noreferrer">Watch on YouTube ↗</a>
    </div>
    <p className="santa-video-note">If the stream is offline or the video cannot play here, use “Watch on YouTube” to open it directly. This player does not show the YouTube live chat.</p>
  </section>;
}
