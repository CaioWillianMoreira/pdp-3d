Coloque aqui as texturas usadas pelo visualizador 3D.

Nomes esperados (exemplos):
- blue.png  -> /textures/blue.png
- white.png -> /textures/white.png
 - yellow.png -> /textures/yellow.png

O `ThreeProductViewer` tenta carregar `/textures/{id}.png` e `/textures/{id}.jpg` onde `{id}` vem do `color.id` do mock.
Se a textura existir, ela será aplicada como `material.map`. Se não existir, o visualizador aplica apenas `material.color`.

Dica: adicione imagens com boa resolução (1024x1024) para resultados melhores.