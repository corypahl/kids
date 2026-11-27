import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ACTIVITIES, CHILDREN, TRIVIA } from './data';
import type { ChildId, Tab } from './data';
import { familyToday, nativeChristmas, readFamilyKey, requestApi, storeFamilyKey } from './api';
import type { VillageState, Wish } from './api';
import { AdventCalendar, GlitterDiary, SantaWishlist } from './Features';
import { VillageHome } from './Village';
import { NaughtyNiceMeter } from './NaughtyNiceMeter';
import { PenguinBowling, ElfDance, RudolphMission } from './ReindeerArcade';
import { PresentBounce, SantaDeliveryRun, ElfCodingAcademy } from './HolidayGames';
import { ChristmasAroundWorld } from './HolidayActivities';
import { NorthPolePassport } from './NorthPolePassport';
import type { PassportStampId } from './NorthPolePassport';
import { ElfDesignSchool, SantaWorkshop } from './Studio';
import { DeviceSettings, readDeviceChild } from './DeviceSettings';
import type { VillageDestination } from './Village';

function daysTillChristmas() {
  const [year, month, day] = familyToday().split('-').map(Number);
  const targetYear = month === 12 && day > 25 ? year + 1 : year;
  return Math.round((Date.UTC(targetYear, 11, 25) - Date.UTC(year, month - 1, day)) / 86400000);
}

function shuffle<T,>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

type MemoryCard = { id: number; symbol: string };
const MEMORY_SYMBOLS = ['🎄', '🎁', '🎅', '🦌', '⭐', '❄️', '🔔', '⛄', '🍪', '🧦'];

function makeDeck(pairs: number): MemoryCard[] {
  return shuffle(MEMORY_SYMBOLS.slice(0, pairs).flatMap((symbol, i) => [
    { id: i * 2, symbol },
    { id: i * 2 + 1, symbol },
  ]));
}

function MemoryGame() {
  const [pairs, setPairs] = useState(4);
  const [cards, setCards] = useState(() => makeDeck(4));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  function reset(size = pairs) {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    setPairs(size);
    setCards(makeDeck(size));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }

  function turn(card: MemoryCard) {
    if (flipped.length === 2 || flipped.includes(card.id) || matched.includes(card.id)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(current => current + 1);
      const first = cards.find(item => item.id === next[0]);
      if (first?.symbol === card.symbol) {
        setMatched(current => [...current, ...next]);
        setFlipped([]);
      } else {
        timeout.current = setTimeout(() => {
          setFlipped([]);
          timeout.current = null;
        }, 950);
      }
    }
  }

  const complete = matched.length === cards.length;
  return (
    <section className="game-panel" aria-label="Christmas memory match">
      <div className="section-row">
        <div>
          <h3>🎄 Christmas Match</h3>
          <p>Find the matching holiday pictures!</p>
        </div>
        <span className="stat-chip">{moves} turns</span>
      </div>
      <div className="difficulty">
        <button className={pairs === 4 ? 'pill selected' : 'pill'} onClick={() => reset(4)}>Easy · 4 pairs</button>
        <button className={pairs === 6 ? 'pill selected' : 'pill'} onClick={() => reset(6)}>Tricky · 6 pairs</button>
      </div>
      <div className="memory-grid">
        {cards.map(card => {
          const visible = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button key={card.id}
              className={'memory-card ' + (visible ? 'up ' : '') + (matched.includes(card.id) ? 'found' : '')}
              onClick={() => turn(card)}
              disabled={matched.includes(card.id) || flipped.length === 2}
              aria-label={visible ? card.symbol : 'Turn over a mystery card'}
              aria-pressed={visible}>
              <span aria-hidden="true">{visible ? card.symbol : '❔'}</span>
            </button>
          );
        })}
      </div>
      {complete && <div className="success" role="status">🎉 You matched every picture! Wonderful job!</div>}
      <button className="action secondary" onClick={() => reset()}>↻ Play again</button>
    </section>
  );
}

type CountingRound = { icon: string; count: number; choices: number[] };
function newCountingRound(): CountingRound {
  const count = Math.floor(Math.random() * 5) + 2;
  const choices = shuffle([count, count === 7 ? 5 : count + 1, count === 2 ? 4 : count - 1]);
  return { icon: ['🎁', '🎄', '⭐', '🦌', '🍪'][Math.floor(Math.random() * 5)], count, choices };
}

function CountingGame() {
  const [round, setRound] = useState(newCountingRound);
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const correct = answered === round.count;
  return (
    <section className="game-panel" aria-label="Count Christmas objects">
      <div className="section-row">
        <div><h3>🎁 Count the Christmas Fun</h3><p>How many pictures can you see?</p></div>
        <span className="stat-chip">⭐ {score} right</span>
      </div>
      <div className="counting-picture" aria-label={String(round.count) + ' holiday objects'}>
        {Array.from({ length: round.count }, (_, i) => <span key={i}>{round.icon}</span>)}
      </div>
      <div className="number-choices">
        {round.choices.map(choice => (
          <button key={choice}
            className={'number-choice ' + (answered === choice ? (correct ? 'correct' : 'incorrect') : '')}
            onClick={() => {
              if (answered !== null) return;
              setAnswered(choice);
              if (choice === round.count) setScore(value => value + 1);
            }}
            disabled={answered !== null}
            aria-label={String(choice) + ' objects'}>{choice}</button>
        ))}
      </div>
      {answered !== null && (
        <div className="feedback" role="status">
          {correct ? '🌟 You got it!' : 'Good try! There are ' + round.count + '. Give the next one a go.'}
          <button className="action" onClick={() => { setRound(newCountingRound()); setAnswered(null); }}>Next round →</button>
        </div>
      )}
    </section>
  );
}

function TriviaGame() {
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const item = TRIVIA[question];
  const finished = question === TRIVIA.length - 1 && answer !== null;
  return (
    <section className="game-panel" aria-label="Holiday trivia">
      <div className="section-row">
        <div><h3>🔔 Christmas Quiz</h3><p>Pick the right answer.</p></div>
        <span className="stat-chip">{question + 1} / {TRIVIA.length}</span>
      </div>
      <div className="quiz-illustration">{item.icon}</div>
      <h4 className="quiz-question">{item.question}</h4>
      <div className="quiz-options">
        {item.options.map((option, i) => (
          <button key={option} className={'quiz-choice ' + (answer !== null && i === item.correct ? 'correct' : '')}
            disabled={answer !== null}
            onClick={() => { setAnswer(i); if (i === item.correct) setScore(s => s + 1); }}>
            {option}
          </button>
        ))}
      </div>
      {answer !== null && (
        <div className="feedback" role="status">
          {answer === item.correct ? '🎉 Yes! That’s right!' : 'The answer is ' + item.options[item.correct] + '!'}
          <button className="action" onClick={() => {
            if (finished) { setQuestion(0); setScore(0); }
            else setQuestion(q => q + 1);
            setAnswer(null);
          }}>{finished ? 'Play again · ' + score + ' right' : 'Next question →'}</button>
        </div>
      )}
    </section>
  );
}

type GameId = 'memory' | 'counting' | 'trivia' | 'penguin-bowling' | 'elf-dance' | 'rudolph-mission' | 'present-bounce' | 'delivery-run' | 'elf-coding';
function Games({ game, setGame, onComplete }: { game: GameId; setGame: (game: GameId) => void; onComplete: (stamp: PassportStampId) => void }) {
  return <section>
    <div className="content-heading">
      <span className="eyebrow">🎮 REINDEER GAMES</span>
      <h2>Reindeer Games</h2><p>Play nine Christmas games! Tap one to begin.</p>
    </div>
    <div className="game-picker">
      {([
        ['memory', '🎄', 'Picture Match', 'Flip and find pairs'],
        ['counting', '🎁', 'Count & Play', 'Great for little elves'],
        ['trivia', '🔔', 'Christmas Quiz', 'Fun holiday questions'],
        ['penguin-bowling', '🐧', 'Penguin Bowling', 'Aim and roll snowballs'],
        ['elf-dance', '🧝', 'Elf Dance', 'Tap arrows to the beat'],
        ['rudolph-mission', '🦌', 'Rudolph’s Mission', 'Flap through the clouds'],
        ['present-bounce', '🎁', 'Present Bounce', 'Build a present path'],
        ['delivery-run', '🛷', 'Delivery Run', 'Aim for chimneys'],
        ['elf-coding', '🧩', 'Elf Coding', 'Program a holiday maze'],
      ] as const).map(([id, icon, label, desc]) =>
        <button type="button" key={id} onClick={() => setGame(id)}
          className={'game-tile ' + (game === id ? 'active' : '')} aria-pressed={game === id}>
          <span className="game-tile-icon">{icon}</span><strong>{label}</strong><small>{desc}</small>
        </button>)}
    </div>
    <div className="arcade-game-area" key={game}>
      {game === 'memory' ? <MemoryGame /> :
        game === 'counting' ? <CountingGame /> :
        game === 'trivia' ? <TriviaGame /> :
        game === 'penguin-bowling' ? <PenguinBowling /> :
        game === 'elf-dance' ? <ElfDance /> :
        game === 'rudolph-mission' ? <RudolphMission /> :
        game === 'present-bounce' ? <PresentBounce onComplete={onComplete} /> :
        game === 'delivery-run' ? <SantaDeliveryRun onComplete={onComplete} /> :
        <ElfCodingAcademy onComplete={onComplete} />}
    </div>
  </section>;
}

function Activities({ child, completed, toggle, initialCategory, showFilters = true }: {
  child: string; completed: number[]; toggle: (id: number) => void;
  initialCategory: 'All' | 'Create' | 'Play' | 'Kindness' | 'Family';
  showFilters?: boolean;
}) {
  const [category, setCategory] = useState(initialCategory);
  const list = category === 'All' ? ACTIVITIES : ACTIVITIES.filter(item => item.category === category);
  return (
    <section>
      <div className="content-heading"><span className="eyebrow">24 DAYS OF FUN</span><h2>Christmas activities</h2><p>Pick any activity whenever you’re ready. Tick it off for {child}!</p></div>
      <div className="progress-card">
        <div className="section-row"><strong>⭐ {child}’s festive adventures</strong><strong>{completed.length} / 24</strong></div>
        <div className="progress-track"><div style={{ width: ((completed.length / 24) * 100) + '%' }} /></div>
        <small>Complete all 24 for a full Christmas calendar!</small>
      </div>
      {showFilters && <div className="filter-row" aria-label="Filter adventures and crafts">
        {(['All', 'Create', 'Play', 'Family'] as const).map(c => (
          <button key={c} type="button" className={'pill ' + (category === c ? 'selected' : '')}
            onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>}
      <div className="activity-grid">
        {list.map(activity => (
          <button key={activity.id} className={'activity-card ' + (completed.includes(activity.id) ? 'done' : '')}
            onClick={() => toggle(activity.id)} aria-pressed={completed.includes(activity.id)}>
            <span className="day-number">DAY {activity.id}</span>
            <span className="activity-emoji">{activity.icon}</span>
            <strong>{activity.title}</strong>
            <small>{activity.detail}</small>
            <span className="activity-status">{completed.includes(activity.id) ? '✓ Done!' : '+ Mark complete'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MrsClausCabin({ child, completed, toggle, initialCategory, onComplete }: {
  child: string; completed: number[]; toggle: (id: number) => void;
  initialCategory: 'All' | 'Create' | 'Play' | 'Kindness' | 'Family';
  onComplete: (stamp: PassportStampId) => void;
}) {
  const [corner, setCorner] = useState<'All' | 'Kindness' | 'World'>(initialCategory === 'Kindness' ? 'Kindness' : 'All');
  return <section className="mrs-claus-cabin">
    <div className="cabin-banner">
      <span className="cabin-icon" aria-hidden="true">👵🏻🏠</span>
      <div><span className="eyebrow">A COZY PLACE FOR CHRISTMAS FUN</span>
        <h1>Mrs. Claus’s Cabin</h1>
        <p>Choose an adventure, make something wonderful, or brighten someone’s day.</p></div>
    </div>
    <div className="cabin-corners" role="group" aria-label="Mrs. Claus's activities">
      <button type="button" className={corner === 'All' ? 'selected' : ''} aria-pressed={corner === 'All'}
        onClick={() => setCorner('All')}><span aria-hidden="true">⭐</span><strong>Adventures & Crafts</strong><small>Activities for every day</small></button>
      <button type="button" className={corner === 'Kindness' ? 'selected' : ''} aria-pressed={corner === 'Kindness'}
        onClick={() => setCorner('Kindness')}><span aria-hidden="true">💚</span><strong>Kindness Corner</strong><small>Make someone smile</small></button>
      <button type="button" className={corner === 'World' ? 'selected' : ''} aria-pressed={corner === 'World'}
        onClick={() => setCorner('World')}><span aria-hidden="true">🌍</span><strong>Around the World</strong><small>Holiday traditions and quizzes</small></button>
    </div>
    {corner === 'World' ? <ChristmasAroundWorld onComplete={onComplete} /> :
      <Activities key={corner} child={child} completed={completed} toggle={toggle}
        initialCategory={corner === 'Kindness' ? 'Kindness' : 'All'}
        showFilters={corner === 'All'} />}
  </section>;
}

function Home({ days, child, childId, opened, ready, onVisit, onOpen, onSettings }: {
  days: number; child: string; childId: ChildId;
  opened: number[]; ready: boolean;
  onVisit: (destination: VillageDestination) => void;
  onOpen: (day: number) => Promise<void>;
  onSettings: () => void;
}) {
  const [adventOpen, setAdventOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!adventOpen) return;
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('.surprise-overlay')) {
        setAdventOpen(false);
        requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.village-spot-advent')?.focus());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [adventOpen]);
  function closeAdvent() {
    setAdventOpen(false);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.village-spot-advent')?.focus());
  }
  return <section className="village-experience">
    <VillageHome child={child} days={days} onSettings={onSettings}
      onVisit={onVisit} onAdvent={() => setAdventOpen(true)} />
    {adventOpen && <div className="village-advent-backdrop">
      <div className="village-advent-dialog" role="dialog" aria-modal="true" aria-labelledby="village-advent-title">
        <div className="village-advent-bar">
          <strong id="village-advent-title">🎄 Advent Tree</strong>
          <button ref={closeButton} type="button" onClick={closeAdvent} aria-label="Close Advent Tree">✕ Close</button>
        </div>
        <AdventCalendar child={childId} opened={opened} onOpen={onOpen}
          goTo={tab => { setAdventOpen(false); onVisit({ tab }); }} enabled={ready} />
      </div>
    </div>}
  </section>;
}

export default function App() {
  const nativeApp = Boolean(nativeChristmas());
  const [tab, setTab] = useState<Tab>('home');
  const [game, setGame] = useState<GameId>('memory');
  const [activityCategory, setActivityCategory] = useState<'All' | 'Create' | 'Play' | 'Kindness' | 'Family'>('All');
  const [child, setChild] = useState<ChildId | null>(readDeviceChild);
  const [settingsOpen, setSettingsOpen] = useState(() => readDeviceChild() === null);
  const [familyKey, setFamilyKey] = useState(readFamilyKey);
  const [keyDraft, setKeyDraft] = useState(familyKey);
  const [state, setState] = useState<VillageState>({ wishes: [], completed: [], opened: [] });
  const [status, setStatus] = useState<'loading' | 'ready' | 'needs-key' | 'error'>(familyKey ? 'loading' : 'needs-key');
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const [, setClockTick] = useState(0);
  // Keep the countdown current if a tablet remains open overnight.
  useEffect(() => {
    const interval = setInterval(() => setClockTick(value => value + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  // Switching buildings should show each destination from its beginning.
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);
  const active = CHILDREN.find(item => item.id === child) ?? CHILDREN[0];

  async function reload(profile: ChildId = child ?? 'emma', key: string = familyKey) {
    const seq = ++sequence.current;
    if (!key) { setStatus(nativeApp ? 'error' : 'needs-key'); if (nativeApp) setError('This Android build is missing its family configuration. Ask a grown-up to install the signed testing release.'); return; }
    setStatus('loading');
    try {
      const value = await requestApi<VillageState>('state?child=' + profile, { key });
      if (seq !== sequence.current) return;
      setState(value); setError(''); setStatus('ready');
    } catch (e) {
      if (seq !== sequence.current) return;
      setStatus('error'); setError(e instanceof Error ? e.message : 'Unable to connect to family storage.');
    }
  }
  useEffect(() => { if (child) void reload(child, familyKey); }, [child, familyKey]);

  async function connect(e: FormEvent) {
    e.preventDefault();
    if (!child) return;
    const key = keyDraft.trim();
    if (!key) return;
    storeFamilyKey(key); setFamilyKey(key);
    await reload(child, key);
  }
  async function addWish(name: string, icon: string) {
    if (!child) return;
    await requestApi('wishes', { method: 'POST', body: { child, name, icon } });
    await reload(child);
  }
  async function changeWish(wish: Wish, remove = false) {
    if (!child) return;
    if (remove) await requestApi('wishes/' + wish.id + '?child=' + child, { method: 'DELETE' });
    else await requestApi('wishes/' + wish.id, { method: 'PATCH', body: { child, favorite: !wish.favorite } });
    await reload(child);
  }
  async function awardStamp(stamp: PassportStampId) {
    if (!child) return;
    try { await requestApi('passport', { method: 'POST', body: { child, stamp } }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save passport stamp.'); }
  }
  async function toggleActivity(id: number) {
    if (!child) return;
    try {
      await requestApi('activities', { method: 'POST', body: { child, id, completed: !state.completed.includes(id) } });
      if (!state.completed.includes(id) && ACTIVITIES.some(a => a.id === id && a.category === 'Kindness')) await awardStamp('kindness');
      await reload(child);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update activity.'); }
  }
  async function openAdvent(day: number) {
    if (!child) return;
    await requestApi('advent', { method: 'POST', body: { child, day } });
    await awardStamp('advent');
    await reload(child);
  }
  const visit = (destination: VillageDestination) => {
    if (destination.tab === 'activities') setActivityCategory(destination.category || 'All');
    setTab(destination.tab);
  };
  const isReady = status === 'ready';
  const untilChristmas = daysTillChristmas();
  const atVillage = Boolean(child && tab === 'home');
  return (
    <div className={atVillage ? "app-shell immersive-shell" : "app-shell"}>
      {!atVillage && <div className="snowflakes" aria-hidden="true">❄︎ &nbsp; ✳ &nbsp; ❅ &nbsp; ✻ &nbsp; ❄︎</div>}
      {!atVillage && <header className="site-header">
        <a href="/" className="brand"><span className="brand-icon">🎄</span><span>Christmas <b>Village</b><small>part of Kids Hub</small></span></a>
        {child && <div className="device-profile-indicator">
          <span className="device-profile-name">{active.icon} {active.name}’s Christmas Village</span>
          <button type="button" className="device-settings-button"
            onClick={() => setSettingsOpen(true)} aria-label="Open parent settings">
            ⚙️ Settings
          </button>
        </div>}
      </header>}
      <main className={atVillage ? "page-main immersive-main" : "page-main"} key={tab + child}>
        {tab !== 'home' && <button type="button" className="village-back" onClick={() => setTab('home')}>← Back to the village</button>}
        {child && !isReady && <div className="family-connect">
          <h3>{nativeApp ? '🎄 Loading Christmas Village' : '🔒 Connect the family’s Christmas storage'}</h3>
          <p>{nativeApp ? 'Your wishes and Glitter’s Diary sync automatically in the Android app.' :
            'Wish lists, Glitter’s photos and recordings, and daily progress are private and shared between devices.'}</p>
          {!nativeApp && <form className="family-key-form" onSubmit={connect}>
            <label htmlFor="family-key">Family key</label>
            <input type="password" id="family-key" value={keyDraft} autoComplete="off"
              onChange={e => setKeyDraft(e.target.value)} placeholder="Family access key" />
            <button className="action" type="submit" disabled={!keyDraft.trim() || status === 'loading'}>
              {status === 'loading' ? 'Connecting…' : 'Connect'}
            </button>
          </form>}
          {status === 'error' && <><p className="form-error" role="alert">{error}</p>
            {nativeApp && <button className="action secondary" onClick={() => void reload()}>Try again</button>}</>}
          {status === 'loading' && <p role="status">Loading family data…</p>}
        </div>}
        {child && isReady && error && <p className="form-error" role="alert">{error}</p>}
        {child && tab === 'home' && <Home days={untilChristmas} child={active.name} childId={child}
          opened={state.opened} ready={isReady} onVisit={visit} onOpen={openAdvent}
          onSettings={() => setSettingsOpen(true)} />}
        {child && tab === 'games' && <Games game={game} setGame={setGame} onComplete={stamp => void awardStamp(stamp)} />}
        {child && tab === 'activities' && isReady && <MrsClausCabin child={active.name} completed={state.completed}
          toggle={id => void toggleActivity(id)} initialCategory={activityCategory} onComplete={stamp => void awardStamp(stamp)} />}
        {child && tab === 'wishlist' && isReady && <SantaWishlist child={active.name} wishes={state.wishes}
          onAdd={addWish} onFavorite={wish => changeWish(wish)} onRemove={wish => changeWish(wish, true)} />}
        {child && tab === 'diary' && isReady && <GlitterDiary child={child} ready={isReady} />}
        {child && tab === 'studio' && <ElfDesignSchool child={child} onComplete={stamp => void awardStamp(stamp)} />}
        {child && tab === 'workshop' && <SantaWorkshop />}
        {child && tab === 'nice-meter' && isReady && <NaughtyNiceMeter child={child} name={active.name} />}
        {child && tab === 'passport' && isReady && <NorthPolePassport child={child} name={active.name}
          onVisit={destination => visit({tab:destination})} />}
      </main>
      {!child && <div className="device-profile-unassigned"><h2>⚙️ Grown-up setup</h2><p>Choose this tablet’s Christmas Village profile to get started.</p></div>}
      {settingsOpen && <DeviceSettings assignedChild={child}
        onClose={child ? () => setSettingsOpen(false) : undefined}
        onSave={profile => {
          if (profile !== child) {
            setState({ wishes: [], completed: [], opened: [] });
            setStatus(familyKey ? 'loading' : 'needs-key');
            setError('');
          }
          setChild(profile);
          setTab('home');
          setSettingsOpen(false);
        }} />}
      {!atVillage && <footer className="site-footer"><span>✨ Made for little Christmas helpers ✨</span><a href="/">← Back to Kids Hub</a></footer>}
    </div>
  );
}