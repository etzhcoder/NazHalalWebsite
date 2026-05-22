export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  category: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

const menu: MenuCategory[] = [
  {
    name: "Platters",
    items: [
      {
        id: "chicken-over-rice",
        name: "Chicken Over Rice",
        description: "Grilled halal chicken served over seasoned yellow rice with white and hot sauce",
        price: 999,
        category: "Platters",
      },
      {
        id: "lamb-over-rice",
        name: "Lamb Over Rice",
        description: "Tender halal lamb gyro meat served over seasoned yellow rice with white and hot sauce",
        price: 1099,
        category: "Platters",
      },
      {
        id: "combo-over-rice",
        name: "Combo Over Rice",
        description: "Both chicken and lamb served over seasoned yellow rice with white and hot sauce",
        price: 1199,
        category: "Platters",
      },
      {
        id: "falafel-over-rice",
        name: "Falafel Over Rice",
        description: "Crispy falafel served over seasoned yellow rice with tahini and hot sauce",
        price: 899,
        category: "Platters",
      },
      {
        id: "kofta-over-rice",
        name: "Kofta Over Rice",
        description: "Seasoned ground beef kofta served over yellow rice with white and hot sauce",
        price: 1099,
        category: "Platters",
      },
    ],
  },
  {
    name: "Gyros & Wraps",
    items: [
      {
        id: "chicken-gyro",
        name: "Chicken Gyro",
        description: "Grilled chicken wrapped in warm pita with lettuce, tomato, and white sauce",
        price: 799,
        category: "Gyros & Wraps",
      },
      {
        id: "lamb-gyro",
        name: "Lamb Gyro",
        description: "Lamb gyro meat wrapped in warm pita with lettuce, tomato, and white sauce",
        price: 899,
        category: "Gyros & Wraps",
      },
      {
        id: "combo-gyro",
        name: "Combo Gyro",
        description: "Chicken and lamb wrapped in warm pita with lettuce, tomato, and white sauce",
        price: 999,
        category: "Gyros & Wraps",
      },
      {
        id: "falafel-wrap",
        name: "Falafel Wrap",
        description: "Crispy falafel wrapped in warm pita with lettuce, tomato, and tahini sauce",
        price: 749,
        category: "Gyros & Wraps",
      },
      {
        id: "kofta-wrap",
        name: "Kofta Wrap",
        description: "Seasoned ground beef kofta wrapped in warm pita with veggies and white sauce",
        price: 899,
        category: "Gyros & Wraps",
      },
      {
        id: "philly-cheesesteak",
        name: "Philly Cheesesteak",
        description: "Shaved beef with melted cheese, onions, and peppers in a hoagie roll",
        price: 999,
        category: "Gyros & Wraps",
      },
    ],
  },
  {
    name: "Burgers",
    items: [
      {
        id: "halal-burger",
        name: "Halal Burger",
        description: "Juicy halal beef patty with lettuce, tomato, and special sauce",
        price: 799,
        category: "Burgers",
      },
      {
        id: "cheese-burger",
        name: "Cheeseburger",
        description: "Halal beef patty topped with melted American cheese, lettuce, and tomato",
        price: 899,
        category: "Burgers",
      },
      {
        id: "double-burger",
        name: "Double Cheeseburger",
        description: "Two halal beef patties with double cheese, lettuce, tomato, and special sauce",
        price: 1099,
        category: "Burgers",
      },
    ],
  },
  {
    name: "Sides",
    items: [
      {
        id: "french-fries",
        name: "French Fries",
        description: "Crispy golden french fries",
        price: 399,
        category: "Sides",
      },
      {
        id: "cheese-fries",
        name: "Cheese Fries",
        description: "French fries topped with melted cheese sauce",
        price: 549,
        category: "Sides",
      },
      {
        id: "chicken-nuggets",
        name: "Chicken Nuggets",
        description: "Crispy halal chicken nuggets (8 pieces)",
        price: 599,
        category: "Sides",
      },
      {
        id: "hummus",
        name: "Hummus",
        description: "Creamy hummus served with warm pita bread",
        price: 499,
        category: "Sides",
      },
      {
        id: "tabbouleh",
        name: "Tabbouleh",
        description: "Fresh parsley salad with bulgur wheat, tomato, and lemon dressing",
        price: 499,
        category: "Sides",
      },
      {
        id: "garden-salad",
        name: "Garden Salad",
        description: "Fresh mixed greens with tomato, cucumber, and your choice of dressing",
        price: 549,
        category: "Sides",
      },
    ],
  },
  {
    name: "Drinks",
    items: [
      {
        id: "soda-can",
        name: "Soda (Can)",
        description: "Coca-Cola, Sprite, or Fanta",
        price: 199,
        category: "Drinks",
      },
      {
        id: "bottled-water",
        name: "Bottled Water",
        description: "16.9 oz bottled water",
        price: 149,
        category: "Drinks",
      },
      {
        id: "mango-lassi",
        name: "Mango Lassi",
        description: "Sweet and creamy mango yogurt drink",
        price: 399,
        category: "Drinks",
      },
      {
        id: "sweet-tea",
        name: "Sweet Tea",
        description: "Freshly brewed sweet iced tea",
        price: 249,
        category: "Drinks",
      },
    ],
  },
];

export function getMenu(): MenuCategory[] {
  return menu;
}

export function getMenuItem(id: string): MenuItem | undefined {
  for (const category of menu) {
    const item = category.items.find((i) => i.id === id);
    if (item) return item;
  }
  return undefined;
}

export function getAllMenuItems(): MenuItem[] {
  return menu.flatMap((c) => c.items);
}
