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
      { id: 'animal-panda', ko: '판다', en: 'Panda', emoji: '🐼' },
      { id: 'animal-elephant', ko: '코끼리', en: 'Elephant', emoji: '🐘' },
      { id: 'animal-lion', ko: '사자', en: 'Lion', emoji: '🦁' },
      { id: 'animal-tiger', ko: '호랑이', en: 'Tiger', emoji: '🐯' },
      { id: 'animal-pig', ko: '돼지', en: 'Pig', emoji: '🐷' },
      { id: 'animal-cow', ko: '소', en: 'Cow', emoji: '🐮' },
      { id: 'animal-horse', ko: '말', en: 'Horse', emoji: '🐴' },
      { id: 'animal-sheep', ko: '양', en: 'Sheep', emoji: '🐑' },
      { id: 'animal-monkey', ko: '원숭이', en: 'Monkey', emoji: '🐵' },
      { id: 'animal-chick', ko: '병아리', en: 'Chick', emoji: '🐥' },
      { id: 'animal-duck', ko: '오리', en: 'Duck', emoji: '🦆' },
      { id: 'animal-frog', ko: '개구리', en: 'Frog', emoji: '🐸' },
      { id: 'animal-fish', ko: '물고기', en: 'Fish', emoji: '🐟' },
      { id: 'animal-whale', ko: '고래', en: 'Whale', emoji: '🐳' },
      { id: 'animal-turtle', ko: '거북이', en: 'Turtle', emoji: '🐢' },
      { id: 'animal-butterfly', ko: '나비', en: 'Butterfly', emoji: '🦋' },
      { id: 'animal-bee', ko: '벌', en: 'Bee', emoji: '🐝' },
      { id: 'animal-ladybug', ko: '무당벌레', en: 'Ladybug', emoji: '🐞' },
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
      { id: 'fruit-lemon', ko: '레몬', en: 'Lemon', emoji: '🍋' },
      { id: 'fruit-kiwi', ko: '키위', en: 'Kiwi', emoji: '🥝' },
      { id: 'fruit-pineapple', ko: '파인애플', en: 'Pineapple', emoji: '🍍' },
      { id: 'fruit-cherry', ko: '체리', en: 'Cherry', emoji: '🍒' },
      { id: 'fruit-blueberry', ko: '블루베리', en: 'Blueberry', emoji: '🫐' },
      { id: 'fruit-coconut', ko: '코코넛', en: 'Coconut', emoji: '🥥' },
      { id: 'fruit-avocado', ko: '아보카도', en: 'Avocado', emoji: '🥑' },
      { id: 'fruit-mango', ko: '망고', en: 'Mango', emoji: '🥭' },
    ],
  },
  {
    id: 'food',
    ko: '음식',
    en: 'Food',
    emoji: '🍚',
    color: '#FDCBB6',
    words: [
      { id: 'food-rice', ko: '밥', en: 'Rice', emoji: '🍚' },
      { id: 'food-bread', ko: '빵', en: 'Bread', emoji: '🍞' },
      { id: 'food-milk', ko: '우유', en: 'Milk', emoji: '🥛' },
      { id: 'food-juice', ko: '주스', en: 'Juice', emoji: '🧃' },
      { id: 'food-water', ko: '물', en: 'Water', emoji: '💧' },
      { id: 'food-cheese', ko: '치즈', en: 'Cheese', emoji: '🧀' },
      { id: 'food-egg', ko: '달걀', en: 'Egg', emoji: '🥚' },
      { id: 'food-cake', ko: '케이크', en: 'Cake', emoji: '🍰' },
      { id: 'food-cookie', ko: '쿠키', en: 'Cookie', emoji: '🍪' },
      { id: 'food-icecream', ko: '아이스크림', en: 'Ice cream', emoji: '🍦' },
      { id: 'food-candy', ko: '사탕', en: 'Candy', emoji: '🍬' },
      { id: 'food-pizza', ko: '피자', en: 'Pizza', emoji: '🍕' },
      { id: 'food-noodle', ko: '면', en: 'Noodles', emoji: '🍜' },
      { id: 'food-carrot', ko: '당근', en: 'Carrot', emoji: '🥕' },
      { id: 'food-corn', ko: '옥수수', en: 'Corn', emoji: '🌽' },
      { id: 'food-broccoli', ko: '브로콜리', en: 'Broccoli', emoji: '🥦' },
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
      { id: 'vehicle-taxi', ko: '택시', en: 'Taxi', emoji: '🚕' },
      { id: 'vehicle-police', ko: '경찰차', en: 'Police car', emoji: '🚓' },
      { id: 'vehicle-fire', ko: '소방차', en: 'Fire truck', emoji: '🚒' },
      { id: 'vehicle-ambulance', ko: '구급차', en: 'Ambulance', emoji: '🚑' },
      { id: 'vehicle-motorcycle', ko: '오토바이', en: 'Motorcycle', emoji: '🏍️' },
      { id: 'vehicle-rocket', ko: '로켓', en: 'Rocket', emoji: '🚀' },
      { id: 'vehicle-tractor', ko: '트랙터', en: 'Tractor', emoji: '🚜' },
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
      { id: 'family-family', ko: '가족', en: 'Family', emoji: '👨‍👩‍👧' },
    ],
  },
  {
    id: 'body',
    ko: '몸',
    en: 'Body',
    emoji: '👀',
    color: '#FFC8DD',
    words: [
      { id: 'body-eye', ko: '눈', en: 'Eye', emoji: '👁️' },
      { id: 'body-nose', ko: '코', en: 'Nose', emoji: '👃' },
      { id: 'body-mouth', ko: '입', en: 'Mouth', emoji: '👄' },
      { id: 'body-ear', ko: '귀', en: 'Ear', emoji: '👂' },
      { id: 'body-hand', ko: '손', en: 'Hand', emoji: '✋' },
      { id: 'body-foot', ko: '발', en: 'Foot', emoji: '🦶' },
      { id: 'body-tooth', ko: '이', en: 'Tooth', emoji: '🦷' },
      { id: 'body-tongue', ko: '혀', en: 'Tongue', emoji: '👅' },
      { id: 'body-heart', ko: '심장', en: 'Heart', emoji: '❤️' },
    ],
  },
  {
    id: 'nature',
    ko: '자연',
    en: 'Nature',
    emoji: '🌳',
    color: '#A0E7A0',
    words: [
      { id: 'nature-sun', ko: '해', en: 'Sun', emoji: '☀️' },
      { id: 'nature-moon', ko: '달', en: 'Moon', emoji: '🌙' },
      { id: 'nature-star', ko: '별', en: 'Star', emoji: '⭐' },
      { id: 'nature-cloud', ko: '구름', en: 'Cloud', emoji: '☁️' },
      { id: 'nature-rain', ko: '비', en: 'Rain', emoji: '🌧️' },
      { id: 'nature-snow', ko: '눈', en: 'Snow', emoji: '❄️' },
      { id: 'nature-rainbow', ko: '무지개', en: 'Rainbow', emoji: '🌈' },
      { id: 'nature-flower', ko: '꽃', en: 'Flower', emoji: '🌸' },
      { id: 'nature-tree', ko: '나무', en: 'Tree', emoji: '🌳' },
      { id: 'nature-leaf', ko: '나뭇잎', en: 'Leaf', emoji: '🍃' },
      { id: 'nature-fire', ko: '불', en: 'Fire', emoji: '🔥' },
      { id: 'nature-mountain', ko: '산', en: 'Mountain', emoji: '⛰️' },
      { id: 'nature-sea', ko: '바다', en: 'Sea', emoji: '🌊' },
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
      { id: 'object-fork', ko: '포크', en: 'Fork', emoji: '🍴' },
      { id: 'object-hat', ko: '모자', en: 'Hat', emoji: '🧢' },
      { id: 'object-shoes', ko: '신발', en: 'Shoes', emoji: '👟' },
      { id: 'object-clock', ko: '시계', en: 'Clock', emoji: '🕐' },
      { id: 'object-umbrella', ko: '우산', en: 'Umbrella', emoji: '☂️' },
      { id: 'object-key', ko: '열쇠', en: 'Key', emoji: '🔑' },
      { id: 'object-phone', ko: '전화', en: 'Phone', emoji: '📞' },
      { id: 'object-bag', ko: '가방', en: 'Bag', emoji: '🎒' },
      { id: 'object-pencil', ko: '연필', en: 'Pencil', emoji: '✏️' },
      { id: 'object-balloon', ko: '풍선', en: 'Balloon', emoji: '🎈' },
      { id: 'object-gift', ko: '선물', en: 'Gift', emoji: '🎁' },
      { id: 'object-camera', ko: '카메라', en: 'Camera', emoji: '📷' },
      { id: 'object-toothbrush', ko: '칫솔', en: 'Toothbrush', emoji: '🪥' },
    ],
  },
  {
    id: 'colors',
    ko: '색깔',
    en: 'Colors',
    emoji: '🎨',
    color: '#FFE066',
    words: [
      { id: 'color-red', ko: '빨강', en: 'Red', emoji: '🔴' },
      { id: 'color-orange', ko: '주황', en: 'Orange', emoji: '🟠' },
      { id: 'color-yellow', ko: '노랑', en: 'Yellow', emoji: '🟡' },
      { id: 'color-green', ko: '초록', en: 'Green', emoji: '🟢' },
      { id: 'color-blue', ko: '파랑', en: 'Blue', emoji: '🔵' },
      { id: 'color-purple', ko: '보라', en: 'Purple', emoji: '🟣' },
      { id: 'color-brown', ko: '갈색', en: 'Brown', emoji: '🟤' },
      { id: 'color-black', ko: '검정', en: 'Black', emoji: '⚫' },
      { id: 'color-white', ko: '하양', en: 'White', emoji: '⚪' },
      { id: 'color-pink', ko: '분홍', en: 'Pink', emoji: '🌸' },
    ],
  },
  {
    id: 'numbers',
    ko: '숫자',
    en: 'Numbers',
    emoji: '🔢',
    color: '#B8E0FF',
    words: [
      { id: 'number-1', ko: '하나', en: 'One', emoji: '1️⃣' },
      { id: 'number-2', ko: '둘', en: 'Two', emoji: '2️⃣' },
      { id: 'number-3', ko: '셋', en: 'Three', emoji: '3️⃣' },
      { id: 'number-4', ko: '넷', en: 'Four', emoji: '4️⃣' },
      { id: 'number-5', ko: '다섯', en: 'Five', emoji: '5️⃣' },
      { id: 'number-6', ko: '여섯', en: 'Six', emoji: '6️⃣' },
      { id: 'number-7', ko: '일곱', en: 'Seven', emoji: '7️⃣' },
      { id: 'number-8', ko: '여덟', en: 'Eight', emoji: '8️⃣' },
      { id: 'number-9', ko: '아홉', en: 'Nine', emoji: '9️⃣' },
      { id: 'number-10', ko: '열', en: 'Ten', emoji: '🔟' },
    ],
  },
];

export const getCategoryById = (id: string): Category | undefined =>
  categories.find((c) => c.id === id);

export function getAllWords(): Word[] {
  return categories.flatMap((c) => c.words);
}

export function shuffleWords(words: Word[]): Word[] {
  const a = [...words];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
