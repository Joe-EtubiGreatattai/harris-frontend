export type Price = Record<string, number>;

export interface Extra {
    name: string;
    price: number;
    isAvailable: boolean;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    prices: Price;
    image: string;
    category: string;
    isBestSeller?: boolean;
    isAvailable?: boolean;
    extras?: Extra[];
}

export const products: Product[] = [
    {
        id: "chef-special",
        name: "Chef Special",
        description: "Beef, sausage, sweet corn, red pepper, green pepper, tomato sauce, mozzarella cheese.",
        prices: { S: 9500, M: 11500, L: 13500, XL: 15500 },
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza",
        isBestSeller: true
    },
    {
        id: "half-half",
        name: "Half/Half Pizza",
        description: "Two of your favorite pizza in one.",
        prices: { S: 10000, M: 12000, L: 15000, XL: 18000 },
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza",
        isBestSeller: true
    },
    {
        id: "create-your-own",
        name: "Create Your Pizza",
        description: "Pick three veggies and two proteins.",
        prices: { S: 9000, M: 12000, L: 15000, XL: 18000 },
        image: "https://images.unsplash.com/photo-1571407970349-bc487eacdea9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    },
    {
        id: "sausage-deluxe",
        name: "Sausage Deluxe",
        description: "A generous spread of sausage, tomato sauce and mozzarella cheese",
        prices: { S: 7000, M: 9000, L: 11000, XL: 13000 },
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza",
        isBestSeller: true
    },
    {
        id: "hot-spicy",
        name: "Hot & Spicy Pizza",
        description: "Red chilli pepper, beef, pepperoni, chilli sauce, sauce, mozzarella cheese.",
        prices: { S: 8500, M: 10500, L: 12500, XL: 14500 },
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    },
    {
        id: "hp-square",
        name: "HP Square Pizza",
        description: "Chicken, Sausage, red pepper, green pepper, sauce, mozzarella cheese.",
        prices: { S: 8500, M: 10500, L: 12500, XL: 14500 },
        image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    },
    {
        id: "seafood",
        name: "Sea Food Pizza",
        description: "Shrimps, tunafish, red chilli pepper, mushroom, sauce and mozzarella cheese",
        prices: { S: 10000, M: 12000, L: 14000, XL: 16000 },
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", // Reuse unique image if possible or generic
        category: "Pizza"
    },
    {
        id: "bbq-chicken",
        name: "BBQ Chicken Pizza",
        description: "Grilled chicken, BBQ sauce, red onions, and mozzarella cheese.",
        prices: { S: 7200, M: 9200, L: 11200, XL: 13200 },
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza",
        isBestSeller: true
    },
    {
        id: "chicken-supreme",
        name: "Chicken Supreme",
        description: "Chicken, mushrooms, mozzarella and sauce",
        prices: { S: 8000, M: 10000, L: 12000, XL: 14000 },
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza",
        isBestSeller: true
    },
    {
        id: "meaty",
        name: "Meaty Pizza",
        description: "Loaded with pepperoni, beef sausage, green peppers and chilli pepper",
        prices: { S: 8300, M: 10300, L: 12300, XL: 14300 },
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    },
    {
        id: "vegetarian",
        name: "Vegetarian",
        description: "A colorful mix of bell peppers, black olives, mushrooms, and red onions, chilli sauce and tomato",
        prices: { S: 7200, M: 9200, L: 11200, XL: 13200 },
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    },
    {
        id: "chicken-peri-peri",
        name: "Chicken Peri Peri",
        description: "Sauced chicken, pineapple, red bell pepper, chilli pepper & mozzarella",
        prices: { S: 7000, M: 9000, L: 11000, XL: 13000 },
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza",
        isBestSeller: true
    },
    {
        id: "hot-mexicana",
        name: "Hot Mexicana",
        description: "Ground beef, jalapeños, red peppers, onions, and mozzarella.",
        prices: { S: 6000, M: 8000, L: 11000, XL: 12000 }, // Note: L is 11000 in image? Assuming pattern holds or using image data exact
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    },
    {
        id: "magharitta",
        name: "Magharitta/Cheese Lovers",
        description: "A perfect blend of mozzarella, parmesan, and cheddar",
        prices: { S: 8000, M: 10000, L: 12000, XL: 14000 },
        image: "https://images.unsplash.com/photo-1589187151053-5ec8818e661b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza",
        isBestSeller: true
    },
    {
        id: "hawaiian",
        name: "Hawaiian Pizza",
        description: "A sweet and savory combo of ham, pineapple chunks, mozzarella.",
        prices: { S: 7400, M: 9400, L: 11400, XL: 13400 },
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    },
    {
        id: "pepperoni",
        name: "Pepperoni Pizza",
        description: "Topped with generous slices of beef pepperoni.",
        prices: { S: 8200, M: 10200, L: 12200, XL: 14200 },
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "Pizza"
    }

]
