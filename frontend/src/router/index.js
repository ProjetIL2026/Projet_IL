import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SalonView from '../views/SalonView.vue'
import MesSalonsView from '../views/account/MesSalonsView.vue'
import SettingsView from '../views/account/SettingsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/accueil'
  },
  { 
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'accueil',
        name: 'home',
        component: HomeView
      },
      {
        path: 'connexion',
        name: 'login',
        component: LoginView
      },
      {
        path: 'salon/:code',
        name: 'room',
        component: SalonView
      },
    ]
  },
  {
    path: '/compte',
    component: MainLayout,
    children: [
      {
        path: 'mes-salons',
        name: 'my-rooms',
        component: MesSalonsView
      },
      {
        path: 'parametres',
        name: 'settings',
        component: SettingsView
      }
    ]
  }
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
