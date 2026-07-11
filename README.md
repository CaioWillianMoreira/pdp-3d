# pdp-d3

Projeto demo Vue 2 + Three.js para visualizar o modelo `MaterialsVariantsShoe.glb`.

Pré-requisitos:
- Node.js (>=14 recomendável)

Instalação e execução em desenvolvimento:

```bash
cd "pdp-d3"
npm install
npm run serve
```

A rota da página de produto é `/produto/:id`. Exemplo:

http://localhost:8080/produto/1

Observações:
- O arquivo GLB foi copiado para `public/models/MaterialsVariantsShoe.glb`.
- Se preferir usar `yarn`, substitua `npm install` por `yarn` e `npm run serve` por `yarn serve`.
