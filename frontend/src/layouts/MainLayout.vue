<template>
  <div class="d-flex flex-column min-vh-100 bg-body">
    <header class="app-navbar fixed-top px-3 px-md-4 d-flex align-items-center justify-content-between">
      
      <div class="d-flex align-items-center gap-4">
        <router-link to="/" class="d-flex align-items-center gap-2 text-decoration-none">
          <span class="fw-bold fs-6 text-white tracking-tight">Watch4Ever</span>
        </router-link>
      </div>

      <div class="d-flex align-items-center gap-3">

        <button type="button" class="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3">
          <i class="bi bi-person"></i>
          <span class="fw-medium">Connexion</span>
        </button>

        <div class="dropdown">
          <button class="btn btn-secondary-custom btn-sm d-flex align-items-center gap-2 px-2 py-1 dropdown-toggle" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="bg-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 26px; height: 26px; font-size: 0.75rem;">L</div>
            <span class="d-none d-md-inline text-white small fw-medium">Lucas</span>
          </button>

          <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark-custom mt-2" aria-labelledby="userMenuButton">
            <li class="px-3 py-2">
              <div class="fw-semibold text-white small">Lucas</div>
              <div class="text-muted" style="font-size: 0.75rem;">lucas.fautrero@alumni.univ-avignon.fr</div>
            </li>
            
            <li><hr class="dropdown-divider"></li>

            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#">
                <i class="bi bi-person"></i> Mon profil
              </a>
            </li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#">
                <i class="bi bi-people"></i> Mes salons
              </a>
            </li>
            <li>
              <a class="dropdown-item d-flex align-items-center gap-2" href="#">
                <i class="bi bi-gear"></i> Paramètres
              </a>
            </li>

            <li><hr class="dropdown-divider"></li>

            <li>
              <a class="dropdown-item d-flex align-items-center gap-2 text-danger" href="#">
                <i class="bi bi-box-arrow-right"></i> Se déconnecter
              </a>
            </li>
          </ul>
        </div>

      </div>
    </header>

    <!-- CONTENU -->
    <main class="flex-grow-1 pt-5 mt-4">
      <router-view />
    </main>

    <!-- FOOTER -->
    <footer class="app-footer mt-auto py-4 px-3 px-md-4">
      <div class="container-fluid max-w-6xl">
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-2">
            <span class="fw-semibold text-white fs-7">Watch4Ever</span>
            <span class="text-muted small">&copy; 2026 Tous droits réservés.</span>
          </div>
          <div class="d-flex align-items-center gap-4">
            <a href="https://github.com/ProjetIL2026/Projet_IL" target="_blank" class="footer-link d-flex align-items-center gap-1">
              <i class="bi bi-github"></i> GitHub
            </a>
            <a href="#" class="footer-link">Plan du site</a>
            <a href="#" class="footer-link">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>

</script>