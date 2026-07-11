<template>
  <div class="product-page">
    <header class="topbar">
      <div class="brand">THESHOES.</div>
      <div class="search">
        <input placeholder="Buscar produto, marca ou modelo" />
      </div>
    </header>

    <main class="container">
      <aside class="left-info">
        <h2 class="title">Ficha Técnica</h2>
        <div v-if="product">
          <div class="rating">{{ product.rating }} ⭐ ({{ product.reviews }})</div>
          <p class="desc">{{ product.description }}</p>
          <ul class="tech">
            <li><strong>Material:</strong> {{ product.technical.material }}</li>
            <li><strong>Peso:</strong> {{ product.technical.weight }}</li>
            <li><strong>Origem:</strong> {{ product.technical.origin }}</li>
          </ul>
        </div>
      </aside>

      <section class="viewer-area">
        <div class="thumbs">
          <button @click="setCamera('lateral')">Lateral</button>
          <button @click="setCamera('lateral_externa')">Lateral Ext</button>
          <button @click="setCamera('traseira')">Traseira</button>
          <button @click="setCamera('superior')">Superior</button>
          <button @click="setCamera('inferior')">Inferior</button>
          <button @click="setCamera('initial')">Frente</button>
        </div>

        <div class="viewer-canvas" ref="viewerContainer"></div>
      </section>

      <aside class="purchase-panel">
        <div v-if="product">
          <h1 class="prod-title">{{ product.title }}</h1>
          <div class="brand-name">{{ product.brand }}</div>
          <div class="price">R$ {{ product.price.toFixed(2) }}</div>

          <div class="sizes">
            <h3>Escolha o tamanho</h3>
            <div class="sizes-grid">
              <button
                v-for="s in product.sizes"
                :key="s"
                :class="{active: selectedSize === s}"
                @click="selectSize(s)">
                {{ s }}
              </button>
            </div>
          </div>

          <div class="colors">
            <h3>Cor</h3>
            <div class="colors-grid">
              <button
                v-for="c in product.colors"
                :key="c.id"
                :class="{active: selectedColor === c.id}"
                :style="{background: c.buttonHex || c.hex}"
                @click="selectColor(c)"></button>
            </div>
          </div>

          <div class="buy">
            <button class="add-cart">Adicionar ao carrinho</button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script>
import ThreeProductViewer from '../services/ThreeProductViewer';
import { fetchProductById } from '../mocks/productMock';

export default {
  name: 'ProductPage',
  data() {
    return {
      product: null,
      selectedColor: null,
      selectedSize: 38,
      colorTarget: 'all',
      basePrice: 0
    };
  },
  mounted() {
    const id = this.$route && this.$route.params ? this.$route.params.id : '1';

    if (this.$refs.viewerContainer) {
      this.threeViewer = new ThreeProductViewer(this.$refs.viewerContainer);

      // ensure we re-request a render when the tab/window becomes visible
      this._onVisibilityChange = () => {
        if (document.visibilityState === 'visible' && this.threeViewer) this.threeViewer.requestRender();
      };
      document.addEventListener('visibilitychange', this._onVisibilityChange);

      // also re-render on window focus (helps when devtools/HMR steal contexts)
      this._onWindowFocus = () => {
        if (this.threeViewer) this.threeViewer.requestRender();
      };
      window.addEventListener('focus', this._onWindowFocus);

      // observe DOM changes inside the viewer container (HMR or other tools may replace the canvas)
      this._canvasObserver = new MutationObserver(() => {
        try {
          const canvas = this.$refs.viewerContainer && this.$refs.viewerContainer.querySelector && this.$refs.viewerContainer.querySelector('canvas');
          if (canvas) {
            if (this.threeViewer && this.threeViewer.requestRender) this.threeViewer.requestRender();
          } else {
            // canvas removed: attempt to dispose and recreate viewer
            if (this.threeViewer && this.threeViewer.dispose) {
              try { this.threeViewer.dispose(); } catch(e){}
            }
            this.threeViewer = new ThreeProductViewer(this.$refs.viewerContainer);
            if (this.product) this.threeViewer.loadModel(this.product.model).catch((err) => console.error(err));
          }
        } catch (e) { /* ignore observer errors */ }
      });
      this._canvasObserver.observe(this.$refs.viewerContainer, { childList: true, subtree: true });
    }

    fetchProductById(id).then((p) => {
      if (!p) return;
      this.product = p;
      this.basePrice = p.price;
      this.selectedColor = p.colors && p.colors[0] ? p.colors[0].id : null;
      this.selectedSize = p.sizes && p.sizes[0] ? p.sizes[0] : 38;
      this.product.price = this.getPriceForSize(this.selectedSize);
      if (this.threeViewer) {
        this.threeViewer.loadModel(p.model).then(() => {
          const selected = p.colors && p.colors.find((x) => x.id === this.selectedColor);
          if (selected) this.selectColor(selected);
        }).catch((err) => console.error(err));
      }
    });
  },
  beforeDestroy() {
    if (this._canvasObserver) this._canvasObserver.disconnect();
    if (this._onVisibilityChange) document.removeEventListener('visibilitychange', this._onVisibilityChange);
    if (this._onWindowFocus) window.removeEventListener('focus', this._onWindowFocus);
    if (this.threeViewer && this.threeViewer.dispose) this.threeViewer.dispose();
  },
  methods: {
    selectColor(c) {
      this.selectedColor = c.id;
      if (!this.threeViewer || !this.product) return;

      const lightenHex = (hex, pct) => {
        if (!hex) return hex;
        const h = hex.replace('#','');
        const full = h.length === 3 ? h.split('').map(ch=>ch+ch).join('') : h;
        const r = parseInt(full.substring(0,2),16);
        const g = parseInt(full.substring(2,4),16);
        const b = parseInt(full.substring(4,6),16);
        const p = Math.max(0, Math.min(1, pct/100));
        const nr = Math.round(r + (255 - r) * p);
        const ng = Math.round(g + (255 - g) * p);
        const nb = Math.round(b + (255 - b) * p);
        const toHex = (v) => (v<16? '0':'') + v.toString(16);
        return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
      };

      const colorToApply = Object.assign({}, c, { hex: lightenHex(c.hex || '#ffffff', 72) });

      if (c.id === 'black') {
        // body should become (light) red, solado must remain black
        const redBase = this.product.colors.find(x => x.id === 'red') || c;
        const body = Object.assign({}, redBase, { hex: lightenHex(redBase.hex || '#C62828', 12) });
        const sole = { id: 'black', hex: '#000000' };
        // apply to requested target(s)
        if (this.colorTarget === 'all') {
          this.threeViewer.setColor('corpo', body);
          this.threeViewer.setColor('solado', sole);
        } else if (this.colorTarget === 'corpo') {
          this.threeViewer.setColor('corpo', body);
          this.threeViewer.setColor('solado', sole);
        } else if (this.colorTarget === 'solado') {
          // user explicitly changed solado -> keep it black
          this.threeViewer.setColor('solado', sole);
        } else {
          // other parts: still apply body as red-ish
          this.threeViewer.setColor(this.colorTarget, body);
          this.threeViewer.setColor('solado', sole);
        }
        return;
      }

      if (this.colorTarget === 'all') {
        this.threeViewer.setColor('all', colorToApply);
      } else {
        this.threeViewer.setColor(this.colorTarget, colorToApply);
      }
    },
    getPriceForSize(size) {
      if (!this.product) return 0;
      if (this.product.priceBySize && this.product.priceBySize[size] != null) {
        return this.product.priceBySize[size];
      }
      const base = this.basePrice || this.product.price || 0;
      const step = 5;
      const price = base + (size - 38) * step;
      return Math.round(price * 100) / 100;
    },
    selectSize(s) {
      this.selectedSize = s;
      this.product.price = this.getPriceForSize(s);
      // size selection affects only UI/ordering, not the 3D model scale
    },
    setCamera(preset) {
      if (this.threeViewer) this.threeViewer.setCameraPreset(preset);
    }
  }
};
</script>

<style lang="scss" scoped>
$purple: #5b2e8e;

.product-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;

  .topbar {
    background: $purple;
    color: #fff;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    .brand { font-weight: 700; letter-spacing: 1px; }
    .search { margin-left: 20px; flex: 1;
      input { width: 100%; padding: 8px 10px; border-radius: 4px; border: none; }
    }
  }

  .container {
    display: grid;
    grid-template-columns: 260px 1fr 360px;
    gap: 20px;
    padding: 24px;
    align-items: start;
  }

  .left-info { background: #fff; padding: 18px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    .title { margin: 0 0 8px; }
    .rating { font-size: 14px; margin-bottom: 8px; }
    .desc { font-size: 13px; color: #333; }
    .tech { margin-top: 12px; li { margin-bottom: 6px; font-size: 13px; } }
  }

  .viewer-area { background: #fafafa; padding: 12px; border-radius: 6px; display: flex; flex-direction: column; align-items: stretch;
    .thumbs { display:flex; gap:8px; margin-bottom:10px; button{padding:6px 8px;border-radius:4px;border:1px solid #ddd;background:#fff}};
    .viewer-canvas { flex:1; min-height:520px; border-radius:6px; overflow:hidden; }
  }

  .purchase-panel { background: #fff; padding: 18px; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    .prod-title { margin:0 0 6px; }
    .brand-name { color:#666; font-size:13px; margin-bottom:8px; }
    .price { color: $purple; font-size:20px; margin: 12px 0; }

    .sizes-grid { display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; margin-top:8px;
      button { padding:8px 6px; border-radius:4px; border:1px solid #ddd; background:#fff; }
      button.active { background:$purple; color:#fff; border-color: darken($purple,5%); }
    }

    .color-controls { display:flex; align-items:center; gap:8px; margin-top:8px; label { font-size:13px; } select { padding:6px; border-radius:4px; } }

    .colors-grid { display:flex; gap:8px; margin-top:8px;
      button { width:36px; height:36px; border-radius:50%; border:2px solid #fff; box-shadow:0 1px 2px rgba(0,0,0,0.12); }
      button.active { outline: 2px solid darken($purple,10%); }
    }

    .buy { margin-top:18px; .add-cart { width:100%; padding:12px; background:$purple; color:#fff; border:none; border-radius:6px; } }
  }
}
</style>

