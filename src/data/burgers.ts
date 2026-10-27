import type { ImageSourcePropType } from 'react-native';

import type { Category } from './extras';
import type { FoodArt } from './foodArt';

// ---------------------------------------------------------------------------
// MENU: 20 items across burgers, pizza, shawarma, sandwiches, chicken,
// snacks and drinks. (The export keeps its old name, BURGERS, so every screen
// that imports it keeps working.)
//
// Every item uses a real photo that is saved inside the app (assets/images),
// so nothing is downloaded while the app runs and no emoji fallback appears.
//
// First run  `node download-images.js`  once from the project root to fetch the
// 20 photos, then restart Expo with  `npx expo start -c`.
//
// The path is relative to THIS file: if this file is src/data/burgers.ts the
// project root is ../../ (as below). If your data folder sits directly in the
// project root, change every ../../assets to ../assets.
//
// To use a different photo for an item, save it in assets/images (same file
// name) or point that item's image at another file with require(...).
// ---------------------------------------------------------------------------

export type Burger = {
  id: string;
  name: string;
  subtitle: string;
  rating: number;
  categories: string[]; // filter chips on Home
  category: Category; // decides the toppings/extras shown when customizing
  emoji: string;
  image: ImageSourcePropType | FoodArt;
  // Details screen
  time: number; // minutes
  description: string;
  unitPrice: number; // price per portion
  spicy: number; // 0 (Mild) to 1 (Hot)
  defaultPortion: number;
};

export const CATEGORIES: string[] = [
  'All',
  'Burgers',
  'Pizza',
  'Shawarma',
  'Sandwiches',
  'Chicken',
  'Snacks',
  'Drinks',
  'Veggie',
];

export const BURGERS: Burger[] = [
  // ------------------------------------------------------------ Burgers
  {
    id: '1',
    name: 'Cheeseburger',
    subtitle: "Wendy's Burger",
    rating: 4.9,
    categories: ['Burgers'],
    category: 'Burgers',
    emoji: '🍔',
    image: require('../../assets/images/cheeseburger.jpg'),
    time: 26,
    description:
      "The Cheeseburger Wendy's Burger is a classic fast food burger that packs a punch of flavor in every bite. Made with a juicy beef patty cooked to perfection, it's topped with melted American cheese, crispy lettuce, ripe tomato, and crunchy pickles.",
    unitPrice: 4.12,
    spicy: 0.6,
    defaultPortion: 2,
  },
  {
    id: '2',
    name: 'Hamburger',
    subtitle: 'Veggie Burger',
    rating: 4.8,
    categories: ['Burgers', 'Veggie'],
    category: 'Burgers',
    emoji: '🍔',
    image: require('../../assets/images/veggieburger.jpg'),
    time: 14,
    description:
      'Enjoy our delicious Hamburger Veggie Burger, made with a savory blend of fresh vegetables and herbs, topped with crisp lettuce, juicy tomatoes, and tangy pickles, all served on a soft, toasted bun.',
    unitPrice: 9.99,
    spicy: 0.78,
    defaultPortion: 1,
  },
  {
    id: '3',
    name: 'Hamburger',
    subtitle: 'Chicken Burger',
    rating: 4.6,
    categories: ['Burgers', 'Chicken'],
    category: 'Burgers',
    emoji: '🍔',
    image: require('../../assets/images/chickenburger.jpg'),
    time: 18,
    description:
      'Our Hamburger Chicken Burger features a tender, golden grilled chicken fillet seasoned with herbs and spices, layered with fresh lettuce, ripe tomato, and creamy mayo on a soft, toasted bun.',
    unitPrice: 7.5,
    spicy: 0.4,
    defaultPortion: 1,
  },
  {
    id: '4',
    name: 'Hamburger',
    subtitle: 'Fried Chicken Burger',
    rating: 4.5,
    categories: ['Burgers', 'Chicken'],
    category: 'Burgers',
    emoji: '🍔',
    image: require('../../assets/images/crispyburger.jpg'),
    time: 20,
    description:
      'Crispy, golden fried chicken with a spicy kick, topped with cool lettuce and a creamy sauce, all tucked inside a fluffy sesame bun. Crunchy on the outside, juicy on the inside.',
    unitPrice: 8.75,
    spicy: 0.7,
    defaultPortion: 1,
  },
  {
    id: '5',
    name: 'Double Burger',
    subtitle: 'Bacon Smash Burger',
    rating: 4.7,
    categories: ['Burgers'],
    category: 'Burgers',
    emoji: '🍔',
    image: require('../../assets/images/baconburger.jpg'),
    time: 22,
    description:
      'Two smashed beef patties with melted cheese, crispy bacon and fresh tomato, stacked high in a toasted sesame bun. Big, bold and built for serious appetites.',
    unitPrice: 11.5,
    spicy: 0.5,
    defaultPortion: 1,
  },

  // -------------------------------------------------------------- Pizza
  {
    id: '6',
    name: 'Pizza',
    subtitle: 'Pepperoni Pizza',
    rating: 4.9,
    categories: ['Pizza'],
    category: 'Pizza',
    emoji: '🍕',
    image: require('../../assets/images/pepperoni.jpg'),
    time: 25,
    description:
      'A hand-stretched crust loaded with stretchy mozzarella and generous slices of spicy pepperoni, baked until the edges are golden and the cheese bubbles.',
    unitPrice: 12.99,
    spicy: 0.55,
    defaultPortion: 1,
  },
  {
    id: '7',
    name: 'Pizza',
    subtitle: 'Margherita Pizza',
    rating: 4.7,
    categories: ['Pizza', 'Veggie'],
    category: 'Pizza',
    emoji: '🍕',
    image: require('../../assets/images/margherita.jpg'),
    time: 22,
    description:
      'The Italian classic: rich tomato sauce, fresh mozzarella and fragrant basil leaves on a thin, crisp crust. Simple, light and always satisfying.',
    unitPrice: 10.99,
    spicy: 0.2,
    defaultPortion: 1,
  },
  {
    id: '8',
    name: 'Pizza',
    subtitle: 'Veggie Supreme Pizza',
    rating: 4.6,
    categories: ['Pizza', 'Veggie'],
    category: 'Pizza',
    emoji: '🍕',
    image: require('../../assets/images/veggiepizza.jpg'),
    time: 24,
    description:
      'Bell peppers, black olives, mushrooms and red onion over melted mozzarella. A colourful, meat-free pizza that is packed with flavour.',
    unitPrice: 11.99,
    spicy: 0.35,
    defaultPortion: 1,
  },
  {
    id: '9',
    name: 'Pizza',
    subtitle: 'BBQ Chicken Pizza',
    rating: 4.8,
    categories: ['Pizza', 'Chicken'],
    category: 'Pizza',
    emoji: '🍕',
    image: require('../../assets/images/bbqpizza.jpg'),
    time: 27,
    description:
      'Tender chicken pieces, red onion and fresh herbs drizzled with smoky barbecue sauce over bubbling cheese. Sweet, smoky and a little tangy.',
    unitPrice: 13.49,
    spicy: 0.5,
    defaultPortion: 1,
  },

  // ----------------------------------------------------------- Shawarma
  {
    id: '10',
    name: 'Shawarma',
    subtitle: 'Chicken Shawarma',
    rating: 4.9,
    categories: ['Shawarma', 'Chicken'],
    category: 'Shawarma',
    emoji: '🌯',
    image: require('../../assets/images/chickenshawarma.jpg'),
    time: 15,
    description:
      'Juicy spiced chicken shaved off the spit and rolled in warm flatbread with crunchy cabbage, tomato and creamy garlic sauce. Wrapped hot, eaten fast.',
    unitPrice: 6.5,
    spicy: 0.6,
    defaultPortion: 1,
  },
  {
    id: '11',
    name: 'Shawarma',
    subtitle: 'Beef Shawarma',
    rating: 4.7,
    categories: ['Shawarma'],
    category: 'Shawarma',
    emoji: '🌯',
    image: require('../../assets/images/beefshawarma.jpg'),
    time: 16,
    description:
      'Slow-roasted, richly seasoned beef with fresh lettuce, tomato and a drizzle of tahini, wrapped in soft flatbread and toasted on the grill.',
    unitPrice: 7.25,
    spicy: 0.7,
    defaultPortion: 1,
  },
  {
    id: '12',
    name: 'Shawarma',
    subtitle: 'Mixed Shawarma',
    rating: 4.8,
    categories: ['Shawarma'],
    category: 'Shawarma',
    emoji: '🌯',
    image: require('../../assets/images/mixedshawarma.jpg'),
    time: 17,
    description:
      'Can\'t choose? Get both. Chicken and beef together with pickled red cabbage, fresh salad and garlic sauce in one hearty wrap.',
    unitPrice: 8,
    spicy: 0.65,
    defaultPortion: 1,
  },

  // -------------------------------------------------------- Sandwiches
  {
    id: '13',
    name: 'Hot Dog',
    subtitle: 'Classic Hot Dog',
    rating: 4.5,
    categories: ['Sandwiches'],
    category: 'Sandwiches',
    emoji: '🌭',
    image: require('../../assets/images/hotdog.jpg'),
    time: 12,
    description:
      'A grilled beef sausage in a soft, toasted bun with a zig-zag of mustard. A ballpark favourite, ready in minutes.',
    unitPrice: 4.5,
    spicy: 0.3,
    defaultPortion: 1,
  },
  {
    id: '14',
    name: 'Sandwich',
    subtitle: 'Italian Sub',
    rating: 4.6,
    categories: ['Sandwiches'],
    category: 'Sandwiches',
    emoji: '🥪',
    image: require('../../assets/images/sub.jpg'),
    time: 15,
    description:
      'A long, fresh-baked roll stuffed with cured meats, melted cheese, crisp lettuce and juicy tomato slices, finished with a splash of vinaigrette.',
    unitPrice: 6.99,
    spicy: 0.4,
    defaultPortion: 1,
  },

  // ------------------------------------------------------------ Chicken
  {
    id: '15',
    name: 'Chicken',
    subtitle: 'Spicy Wings',
    rating: 4.8,
    categories: ['Chicken'],
    category: 'Chicken',
    emoji: '🍗',
    image: require('../../assets/images/wings.jpg'),
    time: 20,
    description:
      'Crispy chicken wings tossed in a fiery glaze with a sticky, sweet-heat finish. Messy in the best way. Napkins recommended.',
    unitPrice: 8.99,
    spicy: 0.9,
    defaultPortion: 1,
  },
  {
    id: '16',
    name: 'Chicken',
    subtitle: 'Crispy Nuggets',
    rating: 4.6,
    categories: ['Chicken', 'Snacks'],
    category: 'Chicken',
    emoji: '🍗',
    image: require('../../assets/images/nuggets.jpg'),
    time: 14,
    description:
      'Golden, bite-sized nuggets of tender chicken in a light crunchy coating, served with a creamy dipping sauce.',
    unitPrice: 5.99,
    spicy: 0.2,
    defaultPortion: 1,
  },
  {
    id: '17',
    name: 'Chicken',
    subtitle: 'Fried Drumsticks',
    rating: 4.7,
    categories: ['Chicken'],
    category: 'Chicken',
    emoji: '🍗',
    image: require('../../assets/images/drumsticks.jpg'),
    time: 22,
    description:
      'Southern-style drumsticks marinated overnight and fried until deeply golden. Crunchy outside, juicy and tender inside.',
    unitPrice: 9.49,
    spicy: 0.6,
    defaultPortion: 1,
  },

  // ------------------------------------------------------------- Snacks
  {
    id: '18',
    name: 'Fries',
    subtitle: 'Crispy French Fries',
    rating: 4.5,
    categories: ['Snacks', 'Veggie'],
    category: 'Snacks',
    emoji: '🍟',
    image: require('../../assets/images/fries.jpg'),
    time: 10,
    description:
      'Thin-cut potatoes fried until golden and crisp, tossed with sea salt and served piping hot. The perfect side or a snack on their own.',
    unitPrice: 2.99,
    spicy: 0.1,
    defaultPortion: 1,
  },
  {
    id: '19',
    name: 'Tacos',
    subtitle: 'Beef Tacos',
    rating: 4.6,
    categories: ['Snacks'],
    category: 'Snacks',
    emoji: '🌮',
    image: require('../../assets/images/tacos.jpg'),
    time: 13,
    description:
      'Crunchy corn shells filled with seasoned beef, shredded lettuce, tomato and cheese, with a squeeze of lime and a kick of salsa.',
    unitPrice: 5.49,
    spicy: 0.6,
    defaultPortion: 2,
  },

  // ------------------------------------------------------------- Drinks
  {
    id: '20',
    name: 'Milkshake',
    subtitle: 'Chocolate Shake',
    rating: 4.8,
    categories: ['Drinks'],
    category: 'Drinks',
    emoji: '🥤',
    image: require('../../assets/images/shake.jpg'),
    time: 8,
    description:
      'Thick, creamy chocolate milkshake blended with real ice cream, topped with whipped cream and a cherry. Ice cold and dangerously easy to finish.',
    unitPrice: 4.5,
    spicy: 0,
    defaultPortion: 1,
  },
];

// Splash screen images (big one on the left, small one in front).
export const SPLASH_IMAGES: { big: ImageSourcePropType | FoodArt; small: ImageSourcePropType | FoodArt } = {
  big: { art: 'cheeseburger' },
  small: { art: 'pepperoni' },
};

// Kept for compatibility (profile photos now come from the user's own upload).
export const AVATAR: ImageSourcePropType = { uri: 'https://i.pravatar.cc/150?img=47' };
