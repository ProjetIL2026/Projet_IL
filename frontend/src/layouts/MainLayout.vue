<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- NAVBAR -->
    <header class="app-navbar fixed-top d-flex align-items-center">
      <div class="container d-flex align-items-center justify-content-between">
        <router-link to="/accueil" class="d-flex align-items-center gap-2 text-decoration-none">
          <div class="brand-badge text-white">
            <i class="bi bi-play-fill fs-5"></i>
          </div>
          <span class="fw-bold fs-5 text-white">Watch4Ever</span>
        </router-link>

        <div class="d-flex align-items-center gap-3">
          
          <!-- État Déconnecté -->
          <router-link to="/connexion" class="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-semibold">
            <i class="bi bi-person"></i>
            <span>Connexion</span>
          </router-link>

          <!-- État Connecté -->
          <div class="dropdown">
            <button class="btn btn-secondary-custom btn-sm d-flex align-items-center gap-2 ps-2 pe-3 py-1 dropdown-toggle" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 28px; height: 28px; font-size: 0.8rem;">L</div>
              <span class="d-none d-sm-inline text-white small fw-semibold">Lucas</span>
            </button>

            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark-custom mt-2" aria-labelledby="userMenuButton">
              <li class="px-3 py-2">
                <div class="fw-semibold text-white small">Lucas</div>
                <div class="text-muted text-truncate" style="font-size: 0.75rem; max-width: 200px;">
                  lucas.fautrero@alumni.univ-avignon.fr
                </div>
              </li>
              
              <li><hr class="dropdown-divider"></li>

              <li>
                <router-link class="dropdown-item d-flex align-items-center gap-2" to="/profil">
                  <i class="bi bi-person"></i> Mon profil
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item d-flex align-items-center gap-2" to="/compte/mes-salons">
                  <i class="bi bi-collection-play"></i> Mes salons
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item d-flex align-items-center gap-2" to="/compte/parametres">
                  <i class="bi bi-gear"></i> Paramètres
                </router-link>
              </li>

              <li><hr class="dropdown-divider"></li>

              <li>
                <button class="dropdown-item d-flex align-items-center gap-2 text-danger">
                  <i class="bi bi-box-arrow-right"></i> Se déconnecter
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </header>

    <!-- CONTENU -->
    <main class="main-content flex-grow-1">
      <router-view />
    </main>

    <!-- FOOTER -->
    <footer class="app-footer mt-auto py-4">
      <div class="container">
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold text-white small">Watch4Ever</span>
            <span class="text-muted small">&copy; 2026 Tous droits réservés.</span>
          </div>
          <div class="d-flex align-items-center gap-4">
            <a href="https://github.com/ProjetIL2026/Projet_IL" target="_blank" rel="noopener" class="footer-link d-flex align-items-center gap-1">
              <i class="bi bi-github"></i> GitHub
            </a>
            <router-link to="/plan-du-site" class="footer-link">Plan du site</router-link>
            <router-link to="/mentions-legales" class="footer-link">Mentions légales</router-link>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>

</script>