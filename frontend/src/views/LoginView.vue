<template>
  <div class="container my-auto py-5" style="max-width: 640px;">
    
    <!-- En-tête -->
    <div class="text-center mb-4">
      <h1 class="fw-bold text-white fs-3 mb-2">Bon retour parmi nous</h1>
      <p class="text-muted small mb-0">Connectez-vous pour retrouver vos salons.</p>
    </div>

    <div class="card p-4 p-md-5">
      <form @submit.prevent="loginForm">
        
        <!-- Email ou Pseudo -->
        <div class="mb-3">
          <label for="emailInput" class="form-label text-white fw-semibold small mb-2">
            Nom d'utilisateur
          </label>
          <input id="usernameInput" v-model="username" type="text" class="form-control" placeholder="YxaSpy" autocomplete="email" required>
        </div>

        <!-- Mot de passe -->
        <div class="mb-4">
            <label for="passwordInput" class="form-label text-white fw-semibold small mb-2">
              Mot de passe
            </label>

          <div class="input-group">
            <input id="passwordInput" v-model="password" type="password" class="form-control border-end-0" placeholder="Votre mot de passe" autocomplete="current-password" required>
          </div>
        </div>

        <button type="submit" class="btn btn-primary fw-semibold w-100 py-2 d-flex align-items-center justify-content-center gap-2">
          <!-- <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> -->
          <span>Se connecter</span>
        </button>

      </form>

      <!-- Lien vers l'inscription -->
      <div class="text-center mt-4 pt-3 border-top border-secondary border-opacity-25">
        <span class="text-muted small">Pas encore de compte ? </span>
        <router-link to="/inscription" class="text-white fw-semibold text-decoration-none small">
          Créer un compte
        </router-link>
      </div>

    </div>

  </div>
</template>

<script setup>
// Script de connexion via appel API
</script>