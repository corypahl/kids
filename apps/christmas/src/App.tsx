import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ACTIVITIES, CHILDREN, TRIVIA, WISH_IDEAS } from './data';
import type { ChildId, Tab } from './data';
import { loadVillage, newWish, saveVillage } from './storage';
import type { VillageData, Wish } from './storage';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Village', icon: '🏠' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'activities', label: 'Activities', icon: '⭐' },
  { id: 'wishlist', label: 'Santa’s List', icon: '🎁' },
];

function daysTillChristmas() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let year = today.getFullYear();
  if (today > new Date(year, 11, 25)) year++;
  return Math.round((new Date(year, 11, 25).getTime() - today.getTime()) / 86400000);
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

function WishList({ child, wishes, addWish, toggleFavorite, removeWish }: {
  child: string;
  wishes: Wish[];
  addWish: (name: string, icon: string) => void;
  toggleFavorite: (id: string) => void;
  removeWish: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError('Tell Santa what you wish for!'); return; }
    addWish(name, icon); setName(''); setIcon('🎁'); setError('');
  }
  async function copyList() {
    const list = wishes.map((wish, i) => String(i + 1) + '. ' + wish.name + (wish.favorite ? ' ⭐ Favorite' : ''));
    try {
      await navigator.clipboard.writeText(child + '’s Christmas wish list\n' + (list.join('\n') || 'No wishes yet'));
      setCopied(true); setCopyError(false);
    } catch {
      setCopyError(true); setCopied(false);
    }
  }
  return (
    <section>
      <div className="content-heading"><span className="eyebrow">LETTERS TO THE NORTH POLE</span><h2>Santa’s wish list 🎅</h2>
        <p>{child} can dream up gift ideas, choose favorites, and change the list anytime.</p>
      </div>
      <div className="wishlist-layout">
        <div className="wishlist-form-card">
          <div className="wish-header-icon">✉️</div>
          <h3>Dear Santa…</h3>
          <p>What would you love for Christmas?</p>
          <form onSubmit={submit}>
            <label htmlFor="wish-name">My Christmas wish</label>
            <input id="wish-name" type="text" value={name} onChange={event => { setName(event.target.value); setError(''); }}
              maxLength={100} placeholder="I would love..." />
            <span className="field-label">Pick a picture</span>
            <div className="icon-picker">
              {['🎁', '🧸', '🎨', '📚', '🧩', '🎮', '⚽', '🚗'].map(choice => (
                <button key={choice} type="button" aria-label={'Picture ' + choice} aria-pressed={icon === choice}
                  className={'icon-choice ' + (icon === choice ? 'selected' : '')} onClick={() => setIcon(choice)}>{choice}</button>
              ))}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="action full" type="submit">+ Add to my list</button>
          </form>
          <div className="idea-divider">Or try an idea</div>
          <div className="wish-ideas">
            {WISH_IDEAS.map(idea => (
              <button key={idea.name} onClick={() => addWish(idea.name, idea.icon)}>
                <span>{idea.icon}</span>{idea.name} <b>+</b>
              </button>
            ))}
          </div>
        </div>
        <div className="wish-list-card">
          <div className="section-row"><div><h3>🎄 {child}’s wishes</h3><p>{wishes.length} {wishes.length === 1 ? 'wish' : 'wishes'} so far</p></div>
            <button className="pill" onClick={copyList} disabled={wishes.length === 0}>📋 Copy list</button>
          </div>
          {copied && <p className="inline-feedback" role="status">List copied! Share it with a grown-up.</p>}
          {copyError && <p className="inline-feedback" role="alert">Copy wasn’t available. Try selecting the wishes below.</p>}
          {wishes.length === 0 ? <div className="empty-wishes"><div>🎅</div><strong>No wishes yet!</strong><p>Add a special wish to get started.</p></div> :
            <div className="wish-items">
              {wishes.map(wish => (
                <div className="wish-item" key={wish.id}>
                  <span className="wish-emoji">{wish.icon}</span>
                  <span className="wish-name">{wish.name}{wish.favorite && <small>⭐ Top wish</small>}</span>
                  <button onClick={() => toggleFavorite(wish.id)} className={'small-icon ' + (wish.favorite ? 'hearted' : '')}
                    aria-label={wish.favorite ? 'Unmark favorite ' + wish.name : 'Mark favorite ' + wish.name}
                    aria-pressed={wish.favorite}>★</button>
                  <button onClick={() => { if (window.confirm('Remove ' + wish.name + ' from the list?')) removeWish(wish.id); }}
                    className="small-icon remove" aria-label={'Remove ' + wish.name}>×</button>
                </div>
              ))}
            </div>
          }
          <p className="storage-note">🔒 Lists are saved only in this browser on this device, not sent to Santa or synced to other tablets. Use “Copy list” to share with a grown-up.</p>
        </div>
      </div>
    </section>
  );
}

function Home({ days, child, completed, wishes, goTo }: { days: number; child: string; completed: number; wishes: number; goTo: (tab: Tab) => void }) {
  return (
    <section>
      <div className="hero">
        <div className="hero-copy">
          <span className="eyebrow">WELCOME TO CHRISTMAS VILLAGE</span>
          <h1>Christmas magic<br /><em>starts here!</em></h1>
          <p>Games to play, memories to make, and a special place for your wishes.</p>
          <div className="countdown"><span className="countdown-icon">🎅</span>
            <span><strong>{days === 0 ? 'Merry Christmas!' : days + ' days'}</strong><small>{days === 0 ? 'Have a wonderful day!' : 'until Christmas Day'}</small></span>
          </div>
          <button className="action light" onClick={() => goTo('games')}>🎮 Let’s play →</button>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="moon">✦</div><div className="tree-art">🎄</div><div className="gift-art">🎁 🧸 🎁</div></div>
      </div>
      <div className="section-row home-title"><div><span className="eyebrow">EXPLORE THE VILLAGE</span><h2>What shall we do today?</h2></div></div>
      <div className="home-cards">
        <button className="home-card games-home" onClick={() => goTo('games')}><span>🎮</span><strong>Play Christmas Games</strong><small>Matching, counting, and festive quiz fun</small><b>Play now →</b></button>
        <button className="home-card activities-home" onClick={() => goTo('activities')}><span>⭐</span><strong>Try a Fun Activity</strong><small>{child} has finished {completed} of 24 adventures</small><b>Explore activities →</b></button>
        <button className="home-card wishlist-home" onClick={() => goTo('wishlist')}><span>🎁</span><strong>Santa’s Wish List</strong><small>{wishes === 0 ? 'Start a special Christmas list' : child + ' has ' + wishes + ' wishes!'}</small><b>See wishes →</b></button>
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [child, setChild] = useState<ChildId>('emma');
  const [data, setData] = useState<VillageData>(loadVillage);
  const [saveError, setSaveError] = useState(false);
  const active = CHILDREN.find(item => item.id === child)!;
  const current = data[child];
  useEffect(() => { setSaveError(!saveVillage(data)); }, [data]);

  function updateChild(change: (current: VillageData[ChildId]) => VillageData[ChildId]) {
    setData(previous => ({ ...previous, [child]: change(previous[child]) }));
  }

  function addWish(name: string, icon: string) {
    if (!name.trim()) return;
    updateChild(item => ({ ...item, wishes: [...item.wishes, newWish(name, icon)] }));
  }

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
        {saveError && <p className="form-error" role="alert">Your browser couldn’t save progress. Check private-browsing or device storage settings.</p>}
        {tab === 'home' && <Home days={daysTillChristmas()} child={active.name} completed={current.completed.length} wishes={current.wishes.length} goTo={setTab} />}
        {tab === 'games' && <Games />}
        {tab === 'activities' && <Activities child={active.name} completed={current.completed}
          toggle={id => updateChild(item => ({
            ...item,
            completed: item.completed.includes(id) ? item.completed.filter(value => value !== id) : [...item.completed, id],
          }))} />}
        {tab === 'wishlist' && <WishList child={active.name} wishes={current.wishes} addWish={addWish}
          toggleFavorite={id => updateChild(item => ({ ...item, wishes: item.wishes.map(wish => wish.id === id ? { ...wish, favorite: !wish.favorite } : wish) }))}
          removeWish={id => updateChild(item => ({ ...item, wishes: item.wishes.filter(wish => wish.id !== id) }))} />}
      </main>
      <footer className="site-footer"><span>✨ Made for little Christmas helpers ✨</span><a href="/">← Back to Kids Hub</a></footer>
    </div>
  );
}
