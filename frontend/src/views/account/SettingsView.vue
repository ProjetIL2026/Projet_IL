<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">

        <div class="text-center mb-4">
          <h1 class="fw-bold mb-1">Paramètres du profil</h1>
          <p class="text-body-secondary mb-0">
            Modifiez vos informations personnelles et votre mot de passe.
          </p>
        </div>

        <!-- pseudo et email -->
        <div class="card rounded-4 shadow-sm mb-4">
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="bg-primary text-white fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-size: 0.8rem;">L</div>
              <div>
                <h5 class="card-title fw-bold mb-0">{{ profil.pseudo }}</h5>
                <small class="text-body-secondary">{{ profil.email }}</small>
              </div>
            </div>

            <!-- <div v-if="alerte.message" :class="`alert alert-${alerte.type} py-2 small rounded-3`">
              {{ alerte.message }}
            </div> -->

            <form @submit.prevent="sauvegarderInfos">
              <div class="mb-3">
                <label for="pseudo" class="form-label fw-medium">Pseudo</label>
                <input id="pseudo" type="text" class="form-control" placeholder="Votre pseudo" required />
              </div>

              <div class="mb-4">
                <label for="email" class="form-label fw-medium">Adresse e-mail</label>
                <input id="email" type="email" class="form-control" placeholder="exemple@univ-avignon.fr" required />
              </div>

              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-primary rounded-pill px-4">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Changer mdp -->
        <div class="card rounded-4 shadow-sm">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-3">Changer le mot de passe</h5>

            <form @submit.prevent="changerMotDePasse">
              <div class="mb-3">
                <label for="mdpActuel" class="form-label fw-medium">Mot de passe actuel</label>
                <input id="mdpActuel" type="password" class="form-control" required />
              </div>

              <div class="mb-3">
                <label for="nouveauMdp" class="form-label fw-medium">Nouveau mot de passe</label>
                <input id="nouveauMdp" type="password" class="form-control" minlength="6" required />
              </div>

              <div class="mb-4">
                <label for="confirmationMdp" class="form-label fw-medium">Confirmer le nouveau mot de passe</label>
                <input id="confirmationMdp" type="password" class="form-control" minlength="6" required />
              </div>

              <div class="d-flex justify-content-end">
                <button type="submit" class="btn btn-outline-primary rounded-pill px-4">
                  Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const profil = ref({
  pseudo: 'Lucas',
  email: 'lucas.fautrero@alumni.univ-avignon.fr'
});
</script>