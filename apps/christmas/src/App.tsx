import { useEffect, useRef, useState } from 'react';
import { ACTIVITIES, CHILDREN, TRIVIA } from './data';
import type { ChildId, Tab } from './data';
import { familyToday, requestApi } from './api';
import type { VillageState, Wish } from './api';
import { AdventCalendar, GlitterDiary, ParentWishes, SantaWishlist } from './Features';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Village', icon: '🏠' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'activities', label: 'Activities', icon: '⭐' },
  { id: 'wishlist', label: 'Santa’s List', icon: '🎁' },
  { id: 'diary', label: 'Glitter’s Diary', icon: '📸' },
  { id: 'parent', label: 'Grown-ups', icon: '🔐' },
];

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

function Games() {
  const [game, setGame] = useState<'memory' | 'counting' | 'trivia'>('memory');
  return (
    <section>
      <div className="content-heading"><span className="eyebrow">SANTA’S ARCADE</span><h2>Let’s play!</h2><p>Choose a game. Everyone can join in.</p></div>
      <div className="game-picker">
        {([
          ['memory', '🎄', 'Picture Match', 'Flip and find pairs'],
          ['counting', '🎁', 'Count & Play', 'Great for little elves'],
          ['trivia', '🔔', 'Christmas Quiz', 'Fun holiday questions'],
        ] as const).map(([id, icon, label, desc]) => (
          <button key={id} onClick={() => setGame(id)} className={'game-tile ' + (game === id ? 'active' : '')}>
            <span className="game-tile-icon">{icon}</span><strong>{label}</strong><small>{desc}</small>
          </button>
        ))}
      </div>
      {game === 'memory' ? <MemoryGame /> : game === 'counting' ? <CountingGame /> : <TriviaGame />}
    </section>
  );
}

function Activities({ child, completed, toggle }: { child: string; completed: number[]; toggle: (id: number) => void }) {
  const [category, setCategory] = useState('All');
  const list = category === 'All' ? ACTIVITIES : ACTIVITIES.filter(item => item.category === category);
  return (
    <section>
      <div className="content-heading"><span className="eyebrow">24 DAYS OF FUN</span><h2>Christmas activities</h2><p>Pick any activity whenever you’re ready. Tick it off for {child}!</p></div>
      <div className="progress-card">
        <div className="section-row"><strong>⭐ {child}’s festive adventures</strong><strong>{completed.length} / 24</strong></div>
        <div className="progress-track"><div style={{ width: ((completed.length / 24) * 100) + '%' }} /></div>
        <small>Complete all 24 for a full Christmas calendar!</small>
      </div>
      <div className="filter-row" aria-label="Filter activities">
        {['All', 'Create', 'Play', 'Kindness', 'Family'].map(c => (
          <button key={c} className={'pill ' + (category === c ? 'selected' : '')} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>
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

function Home({ days, child, childId, completed, wishes, opened, ready, goTo, onOpen }: {
  days: number; child: string; childId: ChildId; completed: number; wishes: number;
  opened: number[]; ready: boolean; goTo: (tab: Tab) => void; onOpen: (day: number) => Promise<void>;
}) {
  return (
    <section>
      <div className="hero">
        <div className="hero-copy">
          <span className="eyebrow">WELCOME TO CHRISTMAS VILLAGE</span>
          <h1>Christmas magic<br /><em>starts here!</em></h1>
          <p>Games, daily surprises, Santa’s wishes, and Glitter’s adventures.</p>
          <div className="countdown"><span className="countdown-icon">🎅</span>
            <span><strong>{days === 0 ? 'Merry Christmas!' : days + ' days'}</strong>
              <small>{days === 0 ? 'Have a wonderful day!' : 'until Christmas Day'}</small></span>
          </div>
          <button className="action light" onClick={() => goTo('wishlist')}>🎁 Tell Santa a wish →</button>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="moon">✦</div><div className="tree-art">🎄</div><div className="gift-art">🎁 🧸 🎁</div></div>
      </div>
      <AdventCalendar child={childId} opened={opened} onOpen={onOpen} goTo={goTo} enabled={ready} />
      <div className="section-row home-title"><div><span className="eyebrow">EXPLORE THE VILLAGE</span><h2>What shall we do today?</h2></div></div>
      <div className="home-cards">
        <button className="home-card games-home" onClick={() => goTo('games')}><span>🎮</span><strong>Christmas Games</strong><small>Matching, counting, and quizzes</small><b>Play now →</b></button>
        <button className="home-card activities-home" onClick={() => goTo('activities')}><span>⭐</span><strong>Fun Activities</strong><small>{child} finished {completed} of 24 adventures</small><b>Try an activity →</b></button>
        <button className="home-card wishlist-home" onClick={() => goTo('wishlist')}><span>🎅</span><strong>Santa’s Wish List</strong><small>{wishes === 0 ? 'Make your Christmas wishes' : child + ' has ' + wishes + ' wishes!'}</small><b>See wishes →</b></button>
        <button className="home-card diary-home" onClick={() => goTo('diary')}><span>📸</span><strong>Glitter’s Diary</strong><small>Photos, little voices, and daily Elf on the Shelf memories</small><b>Visit Glitter →</b></button>
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [child, setChild] = useState<ChildId>('emma');
  const [state, setState] = useState<VillageState>({ wishes: [], completed: [], opened: [] });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const [, setClockTick] = useState(0);
  // Keep the countdown current if a tablet remains open overnight.
  useEffect(() => {
    const interval = setInterval(() => setClockTick(value => value + 1), 60000);
    return () => clearInterval(interval);
  }, []);
  const active = CHILDREN.find(item => item.id === child)!;

  async function reload(profile: ChildId = child) {
    const seq = ++sequence.current;
    setStatus('loading');
    try {
      const value = await requestApi<VillageState>('state?child=' + profile);
      if (seq !== sequence.current) return;
      setState(value); setError(''); setStatus('ready');
    } catch (e) {
      if (seq !== sequence.current) return;
      setStatus('error'); setError(e instanceof Error ? e.message : 'Unable to load family data.');
    }
  }
  useEffect(() => { void reload(child); }, [child]);

  async function addWish(name: string, icon: string) {
    await requestApi('wishes', { method: 'POST', body: { child, name, icon } });
    await reload(child);
  }
  async function changeWish(wish: Wish, remove = false) {
    if (remove) await requestApi('wishes/' + wish.id + '?child=' + child, { method: 'DELETE' });
    else await requestApi('wishes/' + wish.id, { method: 'PATCH', body: { child, favorite: !wish.favorite } });
    await reload(child);
  }
  async function toggleActivity(id: number) {
    try {
      await requestApi('activities', { method: 'POST', body: { child, id, completed: !state.completed.includes(id) } });
      await reload(child);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update activity.'); }
  }
  async function openAdvent(day: number) {
    await requestApi('advent', { method: 'POST', body: { child, day } });
    await reload(child);
  }
  const isReady = status === 'ready';
  const untilChristmas = daysTillChristmas();
  return (
    <div className="app-shell">
      <div className="snowflakes" aria-hidden="true">❄︎ &nbsp; ✳ &nbsp; ❅ &nbsp; ✻ &nbsp; ❄︎</div>
      <header className="site-header">
        <a href="/" className="brand"><span className="brand-icon">🎄</span><span>Christmas <b>Village</b><small>part of Kids Hub</small></span></a>
        <div className="profile-chooser">
          <span>Who’s playing?</span>
          <div className="profiles" role="group" aria-label="Choose child">
            {CHILDREN.map(item => <button key={item.id}
              className={'profile ' + item.color + (child === item.id ? ' active' : '')}
              onClick={() => setChild(item.id)} aria-pressed={child === item.id}>
              <span>{item.icon}</span>{item.name}</button>)}
          </div>
        </div>
      </header>
      <nav className="main-nav" aria-label="Christmas Village sections">
        {TABS.map(item => <button key={item.id} onClick={() => setTab(item.id)}
          className={tab === item.id ? 'nav-item active' : 'nav-item'}
          aria-current={tab === item.id ? 'page' : undefined}>
          <span>{item.icon}</span>{item.label}
        </button>)}
      </nav>
      <main className="page-main" key={tab + child}>
        {!isReady && <div className="family-connect">
          <h3>{status === 'loading' ? '☁️ Loading Christmas Village…' : '🔒 Family data is unavailable'}</h3>
          {status === 'loading' ? <p role="status">Getting your saved wishes, activity progress, and Glitter’s Diary…</p> : <>
            <p>Your Cloudflare Access session may need to be refreshed. The family data stays private.</p>
            <p className="form-error" role="alert">{error}</p>
            <button className="action" type="button" onClick={() => void reload(child)}>Retry</button>
          </>}
        </div>}
        {isReady && <div className="family-status"><span>☁️ Family data synced</span></div>}
        {isReady && error && <p className="form-error" role="alert">{error}</p>}
        {tab === 'home' && <Home days={untilChristmas} child={active.name} childId={child}
          completed={state.completed.length} wishes={state.wishes.length} opened={state.opened}
          ready={isReady} goTo={setTab} onOpen={openAdvent} />}
        {tab === 'games' && <Games />}
        {tab === 'activities' && isReady && <Activities child={active.name} completed={state.completed}
          toggle={id => void toggleActivity(id)} />}
        {tab === 'wishlist' && isReady && <SantaWishlist child={active.name} wishes={state.wishes}
          onAdd={addWish} onFavorite={wish => changeWish(wish)} onRemove={wish => changeWish(wish, true)} />}
        {tab === 'diary' && isReady && <GlitterDiary child={child} ready={isReady} />}
        {tab === 'parent' && isReady && <ParentWishes />}
      </main>
      <footer className="site-footer"><span>✨ Made for little Christmas helpers ✨</span><a href="/">← Back to Kids Hub</a></footer>
    </div>
  );
}