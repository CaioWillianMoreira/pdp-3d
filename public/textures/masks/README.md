Máscaras opcionais para preservar regiões (ex.: solado) ao aplicar texturas.

Nomes esperados (exemplos):
- blue.png -> /textures/masks/blue.png

Formato: imagens em tons de cinza onde pixels brancos (255,255,255) indicam áreas a preservar (não alteradas pela nova textura). Use o mesmo `{id}` das texturas.

Se fornecer máscaras, o visualizador irá tentar compor a nova textura preservando os pixels brancos da máscara ou do mapa original do material.