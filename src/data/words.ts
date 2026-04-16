export type Lang = 'ko' | 'en';

export type Word = {
  id: string;
  ko: string;
  en: string;
  emoji: string;
};

export type Category = {
  id: string;
  ko: string;
  en: string;
  emoji: string;
  color: string;
  words: Word[];
};

export const categories: Category[] = [
  {
    id: 'animals',
    ko: '동물',
    en: 'Animals',
    emoji: '🐾',
    color: '#FFD6A5',
    words: [
      { id: 'animal-dog', ko: '강아지', en: 'Dog', emoji: '🐶' },
      { id: 'animal-cat', ko: '고양이', en: 'Cat', emoji: '🐱' },
      { id: 'animal-rabbit', ko: '토끼', en: 'Rabbit', emoji: '🐰' },
      { id: 'animal-bear', ko: '곰', en: 'Bear', emoji: '🐻' },
      { id: 'animal-elephant', ko: '코끼리', en: 'Elephant', emoji: '🐘' },
      { id: 'animal-lion', ko: '사자', en: 'Lion', emoji: '🦁' },
      { id: 'animal-tiger', ko: '호랑이', en: 'Tiger', emoji: '🐯' },
      { id: 'animal-duck', ko: '오리', en: 'Duck', emoji: '🦆' },
    ],
  },
  {
    id: 'fruits',
    ko: '과일',
    en: 'Fruits',
    emoji: '🍎',
    color: '#FFADAD',
    words: [
      { id: 'fruit-apple', ko: '사과', en: 'Apple', emoji: '🍎' },
      { id: 'fruit-banana', ko: '바나나', en: 'Banana', emoji: '🍌' },
      { id: 'fruit-strawberry', ko: '딸기', en: 'Strawberry', emoji: '🍓' },
      { id: 'fruit-grape', ko: '포도', en: 'Grape', emoji: '🍇' },
      { id: 'fruit-pear', ko: '배', en: 'Pear', emoji: '🍐' },
      { id: 'fruit-tangerine', ko: '귤', en: 'Tangerine', emoji: '🍊' },
      { id: 'fruit-watermelon', ko: '수박', en: 'Watermelon', emoji: '🍉' },
      { id: 'fruit-peach', ko: '복숭아', en: 'Peach', emoji: '🍑' },
    ],
  },
  {
    id: 'vehicles',
    ko: '탈것',
    en: 'Vehicles',
    emoji: '🚗',
    color: '#BDE0FE',
    words: [
      { id: 'vehicle-car', ko: '자동차', en: 'Car', emoji: '🚗' },
      { id: 'vehicle-bus', ko: '버스', en: 'Bus', emoji: '🚌' },
      { id: 'vehicle-train', ko: '기차', en: 'Train', emoji: '🚆' },
      { id: 'vehicle-airplane', ko: '비행기', en: 'Airplane', emoji: '✈️' },
      { id: 'vehicle-boat', ko: '배', en: 'Boat', emoji: '🚢' },
      { id: 'vehicle-bicycle', ko: '자전거', en: 'Bicycle', emoji: '🚲' },
      { id: 'vehicle-truck', ko: '트럭', en: 'Truck', emoji: '🚚' },
      { id: 'vehicle-helicopter', ko: '헬리콥터', en: 'Helicopter', emoji: '🚁' },
    ],
  },
  {
    id: 'family',
    ko: '가족',
    en: 'Family',
    emoji: '👨‍👩‍👧',
    color: '#CAFFBF',
    words: [
      { id: 'family-mom', ko: '엄마', en: 'Mom', emoji: '👩' },
      { id: 'family-dad', ko: '아빠', en: 'Dad', emoji: '👨' },
      { id: 'family-grandma', ko: '할머니', en: 'Grandma', emoji: '👵' },
      { id: 'family-grandpa', ko: '할아버지', en: 'Grandpa', emoji: '👴' },
      { id: 'family-sister', ko: '언니', en: 'Sister', emoji: '👧' },
      { id: 'family-brother', ko: '오빠', en: 'Brother', emoji: '👦' },
      { id: 'family-baby', ko: '아기', en: 'Baby', emoji: '👶' },
      { id: 'family-aunt', ko: '이모', en: 'Aunt', emoji: '🧑‍🦰' },
    ],
  },
  {
    id: 'objects',
    ko: '사물',
    en: 'Objects',
    emoji: '🎾',
    color: '#E0C3FC',
    words: [
      { id: 'object-ball', ko: '공', en: 'Ball', emoji: '⚽' },
      { id: 'object-cup', ko: '컵', en: 'Cup', emoji: '🥤' },
      { id: 'object-doll', ko: '인형', en: 'Doll', emoji: '🧸' },
      { id: 'object-book', ko: '책', en: 'Book', emoji: '📖' },
      { id: 'object-spoon', ko: '숟가락', en: 'Spoon', emoji: '🥄' },
      { id: 'object-hat', ko: '모자', en: 'Hat', emoji: '🧢' },
      { id: 'object-shoes', ko: '신발', en: 'Shoes', emoji: '👟' },
      { id: 'object-clock', ko: '시계', en: 'Clock', emoji: '🕐' },
    ],
  },
];

export const getCategoryById = (id: string): Category | undefined =>
  categories.find((c) => c.id === id);
