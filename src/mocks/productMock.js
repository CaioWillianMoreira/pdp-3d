// Mock de produtos para simular API local
const products = {
  "1": {
    id: "1",
    title: "Tênis Variants",
    brand: "Khronos Test",
    price: 349.9,
    rating: 4.71,
    reviews: 1423,
    description: "Modelo de demonstração com variantes de material e cores (GLB).",
    model: "/models/MaterialsVariantsShoe.glb",
    images: [
      "/images/shoe-1.jpg",
      "/images/shoe-2.jpg",
      "/images/shoe-3.jpg"
    ],
    sizes: [34,35,36,37,38,39,40,41,42,43,44],
    colors: [
      { id: "white", name: "Branco", hex: "#FFFFFF", buttonHex: "#00CFCF" },
      { id: "blue", name: "Azul", hex: "#1565C0" },
      { id: "yellow", name: "Amarelo", hex: "#FFD600" },
      { id: "pink", name: "Rosa", hex: "#F48FB1", buttonHex: "#F48FB1" }
    ],
    technical: {
      material: "Couro sintético / Têxtil",
      weight: "~320g (par)",
      origin: "Fabricado para demo"
    }
  }
};

export function fetchProductById(id) {
  return new Promise((resolve) => {
    // simula latência de rede leve
    setTimeout(() => {
      resolve(products[String(id)] || null);
    }, 150);
  });
}

export function listProducts() {
  return Object.values(products);
}

export default {
  fetchProductById,
  listProducts
};
