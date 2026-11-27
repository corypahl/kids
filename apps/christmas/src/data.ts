export type ChildId = 'emma' | 'sophie' | 'adam';
export type Tab = 'home' | 'games' | 'activities' | 'wishlist' | 'diary' | 'studio' | 'santa-live' | 'reindeer';

export const CHILDREN: { id: ChildId; name: string; icon: string; color: string }[] = [
  { id: 'emma', name: 'Emma', icon: '🦌', color: 'pink' },
  { id: 'sophie', name: 'Sophie', icon: '🧝', color: 'purple' },
  { id: 'adam', name: 'Adam', icon: '☃️', color: 'blue' },
];

export type ChristmasActivity = {
  id: number;
  title: string;
  detail: string;
  icon: string;
  category: 'Create' | 'Play' | 'Kindness' | 'Family';
};

export const ACTIVITIES: ChristmasActivity[] = [
  { id: 1, title: 'Make a paper snowflake', detail: 'Fold paper and ask a grown-up to help cut a design.', icon: '❄️', category: 'Create' },
  { id: 2, title: 'Read a Christmas story', detail: 'Cuddle up and pick a holiday book together.', icon: '📖', category: 'Family' },
  { id: 3, title: 'Draw a Christmas tree', detail: 'Add a star and lots of colorful ornaments.', icon: '🎄', category: 'Create' },
  { id: 4, title: 'Dance to a Christmas song', detail: 'Invent your own silly holiday dance.', icon: '🎵', category: 'Play' },
  { id: 5, title: 'Make someone a card', detail: 'Give your card to someone who could use a smile.', icon: '💌', category: 'Kindness' },
  { id: 6, title: 'Count the decorations', detail: 'See how many ornaments or lights you can spot.', icon: '🔔', category: 'Play' },
  { id: 7, title: 'Help wrap a present', detail: 'Make a bow or decorate a gift tag.', icon: '🎁', category: 'Kindness' },
  { id: 8, title: 'Make hot cocoa', detail: 'Ask a grown-up to help with the warm drink.', icon: '☕', category: 'Family' },
  { id: 9, title: 'Build a blanket fort', detail: 'Make it cozy with pillows and Christmas books.', icon: '🏠', category: 'Play' },
  { id: 10, title: 'Create a paper chain', detail: 'Join red, green, and white loops together.', icon: '🔗', category: 'Create' },
  { id: 11, title: 'Give a big thank-you', detail: 'Tell someone what you love about them.', icon: '💚', category: 'Kindness' },
  { id: 12, title: 'Find five red things', detail: 'Look around the house for festive colors.', icon: '❤️', category: 'Play' },
  { id: 13, title: 'Decorate a cookie', detail: 'Make a funny face or snowy pattern.', icon: '🍪', category: 'Family' },
  { id: 14, title: 'Make a reindeer picture', detail: 'Use your handprint as the antlers.', icon: '🦌', category: 'Create' },
  { id: 15, title: 'Help with a chore', detail: 'Surprise your family with a helpful hand.', icon: '🧹', category: 'Kindness' },
  { id: 16, title: 'Play Christmas I Spy', detail: 'Take turns spotting seasonal objects.', icon: '👀', category: 'Play' },
  { id: 17, title: 'Make a decoration', detail: 'Create an ornament from paper or craft supplies.', icon: '⭐', category: 'Create' },
  { id: 18, title: 'Share a favorite toy', detail: 'Invite a sibling to play together.', icon: '🧸', category: 'Kindness' },
  { id: 19, title: 'Watch a Christmas movie', detail: 'Get blankets and vote on a family movie.', icon: '🎬', category: 'Family' },
  { id: 20, title: 'Build a snowman', detail: 'Use snow outside or draw one indoors.', icon: '☃️', category: 'Play' },
  { id: 21, title: 'Make a holiday crown', detail: 'Decorate paper with stars and snowflakes.', icon: '👑', category: 'Create' },
  { id: 22, title: 'Sing a carol together', detail: 'Take turns choosing a favorite song.', icon: '🎤', category: 'Family' },
  { id: 23, title: 'Put out a kind surprise', detail: 'Leave a nice note for someone to find.', icon: '💝', category: 'Kindness' },
  { id: 24, title: 'Christmas Eve tradition', detail: 'Choose a favorite cozy family tradition.', icon: '🕯️', category: 'Family' },
];

export const WISH_IDEAS = [
  { name: 'Building blocks', icon: '🧱' },
  { name: 'Stuffed animal', icon: '🧸' },
  { name: 'Art supplies', icon: '🎨' },
  { name: 'Book', icon: '📚' },
  { name: 'Board game', icon: '🎲' },
  { name: 'Puzzle', icon: '🧩' },
  { name: 'Sports ball', icon: '⚽' },
  { name: 'Toy car', icon: '🚗' },
];

export const TRIVIA = [
  { question: 'What pulls Santa’s sleigh?', options: ['Reindeer', 'Dolphins', 'Penguins'], correct: 0, icon: '🦌' },
  { question: 'What goes on top of many Christmas trees?', options: ['A sandwich', 'A star', 'A shoe'], correct: 1, icon: '⭐' },
  { question: 'Which color is Santa’s famous suit?', options: ['Purple', 'Blue', 'Red'], correct: 2, icon: '🎅' },
  { question: 'What do you hang on a Christmas tree?', options: ['Ornaments', 'Spoons', 'Socks'], correct: 0, icon: '🎄' },
  { question: 'What can you build with snow?', options: ['A submarine', 'A snowman', 'A bicycle'], correct: 1, icon: '☃️' },
  { question: 'Which one makes a jingling sound?', options: ['Pillow', 'Bell', 'Book'], correct: 1, icon: '🔔' },
  { question: 'Where do you put a wrapped gift?', options: ['Under the tree', 'In the bathtub', 'In the oven'], correct: 0, icon: '🎁' },
  { question: 'What is a candy cane shaped like?', options: ['A circle', 'A square', 'A hook'], correct: 2, icon: '🍬' },
];
