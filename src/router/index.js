import Vue from 'vue';
import Router from 'vue-router';
import ProductPage from '@/views/ProductPage.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/produto/:id',
      name: 'ProductPage',
      component: ProductPage,
      props: true
    },
    {
      path: '/',
      redirect: '/produto/1'
    }
  ]
});

export default router;
