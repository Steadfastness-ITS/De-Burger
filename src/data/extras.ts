import type { ImageSourcePropType } from 'react-native';

// Food categories that have their own toppings. Defined here so this file does
// not depend on a separate foods.ts.
export type Category =
  | 'Burgers'
  | 'Combos'
  | 'Pizza'
  | 'Shawarma'
  | 'Sandwiches'
  | 'Chicken'
  | 'Snacks'
  | 'Desserts'
  | 'Drinks';

// ---------------------------------------------------------------------------
// TOPPINGS / ADD-ONS (depend on the kind of food) + SIDE OPTIONS (shared)
//
// Each item shows an emoji by default. To use real photos, add an `image`,
// e.g.  image: require('../../assets/images/tomato.png')
// ---------------------------------------------------------------------------

export type Extra = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  image?: ImageSourcePropType;
};

type AddonSet = { title: string; items: Extra[] };

export const ADDONS: Record<Category, AddonSet> = {
  Burgers: {
    title: 'Toppings',
    items: [
      { id: 'tomato', name: 'Tomato', price: 0.3, emoji: '🍅' },
      { id: 'onions', name: 'Onions', price: 0.25, emoji: '🧅' },
      { id: 'pickles', name: 'Pickles', price: 0.25, emoji: '🥒' },
      { id: 'bacons', name: 'Bacons', price: 1.0, emoji: '🥓' },
    ],
  },
  Combos: {
    title: 'Toppings',
    items: [
      { id: 'sauce', name: 'Extra Sauce', price: 0.5, emoji: '🥫' },
      { id: 'cheese', name: 'Cheese', price: 0.6, emoji: '🧀' },
      { id: 'pickles', name: 'Pickles', price: 0.25, emoji: '🥒' },
      { id: 'bacons', name: 'Bacons', price: 1.0, emoji: '🥓' },
    ],
  },
  Pizza: {
    title: 'Toppings',
    items: [
      { id: 'cheese', name: 'Extra Cheese', price: 1.0, emoji: '🧀' },
      { id: 'pepperoni', name: 'Pepperoni', price: 1.25, emoji: '🥩' },
      { id: 'mushrooms', name: 'Mushrooms', price: 0.8, emoji: '🍄' },
      { id: 'peppers', name: 'Peppers', price: 0.6, emoji: '🌶️' },
    ],
  },
  Shawarma: {
    title: 'Toppings',
    items: [
      { id: 'chicken', name: 'Extra Meat', price: 1.5, emoji: '🍗' },
      { id: 'garlic', name: 'Garlic Sauce', price: 0.4, emoji: '🧄' },
      { id: 'pickles', name: 'Pickles', price: 0.25, emoji: '🥒' },
      { id: 'hot', name: 'Hot Sauce', price: 0.3, emoji: '🌶️' },
    ],
  },
  Sandwiches: {
    title: 'Toppings',
    items: [
      { id: 'cheese', name: 'Cheese', price: 0.6, emoji: '🧀' },
      { id: 'onions', name: 'Onions', price: 0.25, emoji: '🧅' },
      { id: 'mustard', name: 'Mustard', price: 0.2, emoji: '🥫' },
      { id: 'jalapeno', name: 'Jalapeños', price: 0.4, emoji: '🌶️' },
    ],
  },
  Chicken: {
    title: 'Extras',
    items: [
      { id: 'rub', name: 'Spicy Rub', price: 0.5, emoji: '🌶️' },
      { id: 'dip', name: 'Dip Sauce', price: 0.6, emoji: '🥫' },
      { id: 'lemon', name: 'Lemon', price: 0.2, emoji: '🍋' },
      { id: 'butter', name: 'Garlic Butter', price: 0.5, emoji: '🧈' },
    ],
  },
  Snacks: {
    title: 'Dips & Sauces',
    items: [
      { id: 'cheese', name: 'Cheese Dip', price: 0.7, emoji: '🧀' },
      { id: 'ketchup', name: 'Ketchup', price: 0.1, emoji: '🍅' },
      { id: 'chili', name: 'Chili Sauce', price: 0.3, emoji: '🌶️' },
      { id: 'mayo', name: 'Mayo', price: 0.2, emoji: '🥚' },
    ],
  },
  Desserts: {
    title: 'Toppings',
    items: [
      { id: 'choco', name: 'Chocolate', price: 0.5, emoji: '🍫' },
      { id: 'sprinkles', name: 'Sprinkles', price: 0.3, emoji: '✨' },
      { id: 'cream', name: 'Whipped Cream', price: 0.5, emoji: '🍦' },
      { id: 'cherry', name: 'Cherry', price: 0.3, emoji: '🍒' },
    ],
  },
  Drinks: {
    title: 'Add-ons',
    items: [
      { id: 'ice', name: 'Extra Ice', price: 0.1, emoji: '🧊' },
      { id: 'lemon', name: 'Lemon Slice', price: 0.2, emoji: '🍋' },
      { id: 'mint', name: 'Mint', price: 0.2, emoji: '🌿' },
      { id: 'sugar', name: 'Extra Sugar', price: 0.1, emoji: '🍬' },
    ],
  },
};

// Toppings shown on the burger customize screen.
export const TOPPINGS: Extra[] = ADDONS.Burgers.items;

export const SIDES: Extra[] = [
  { id: 'fries', name: 'Fries', price: 1.99, emoji: '🍟' },
  { id: 'coleslaw', name: 'Coleslaw', price: 1.49, emoji: '🥗' },
  { id: 'salad', name: 'Salad', price: 1.29, emoji: '🥬' },
  { id: 'onion-rings', name: 'Onion', price: 1.79, emoji: '🧅' },
];
