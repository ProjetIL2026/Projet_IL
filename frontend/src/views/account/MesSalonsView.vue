<template>
  <div class="container py-5">
    <!-- En-tête simple sans hero header -->
    <div class="text-center mb-5">
      <h1 class="fw-bold mb-3">Mes salons</h1>
      <button type="button" class="btn btn-primary fw-bold rounded-pill px-4 d-inline-flex align-items-center gap-2" @click="ouvrirModale">
        <i class="bi bi-plus-lg"></i>
        <span>Créer un salon</span>
      </button>
    </div>

    <!-- Salons -->
    <div class="row g-4">
      <div v-for="salon in tousLesSalons" :key="salon.id" class="col-12 col-sm-6 col-lg-3">
        <div class="card h-100 rounded-4 shadow-sm">
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="small fw-bold text-uppercase font-monospace salon-code-spacing mb-1">
                {{ salon.code }}
              </div>
              <h5 class="card-title fw-bold mb-4">{{ salon.nom }}</h5>
            </div>

            <div>
              <!-- Code et bouton copier -->
              <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                <span class="small fw-medium">{{ salon.code }}</span>
                <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="copierCode(salon)">
                  {{ codeCopieId === salon.id ? 'Copié !' : 'Copier le code' }}
                </button>
              </div>

              <!-- Bouton Rejoindre -->
              <button type="button" class="btn btn-primary rounded-pill w-100">
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- si il n'y a pas de salons -->
    <!-- <div v-else class="text-center py-5">
      <p class="text-body-secondary mb-3">Vous n'avez encore créé aucun salon.</p>
      <button type="button" class="btn btn-primary rounded-pill px-4" @click="ouvrirModale">
        Créer mon premier salon
      </button>
    </div> -->

    <!-- Modale -->
    <div v-if="modaleOuverte" class="modal fade show d-block bg-dark bg-opacity-50" tabindex="-1" @click.self="modaleOuverte = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Créer un salon</h5>
            <button type="button" class="btn-close" @click="modaleOuverte = false"></button>
          </div>
          <form @submit.prevent="creerSalon">
            <div class="modal-body">
              <label class="form-label">Nom du salon</label>
              <input v-model.trim="nouveauNomSalon" type="text" class="form-control" placeholder="Ex: GAMING" required/>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-outline-secondary rounded-pill" @click="modaleOuverte = false">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary rounded-pill px-4">
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const tousLesSalons = ref([
  { id: 1, code: 'EK9POM', nom: 'GAMING' },
  { id: 2, code: '25DRAE', nom: 'FUN' },
  { id: 3, code: 'FOZJ6G', nom: 'CHILL' },
  { id: 4, code: 'ZRRICX', nom: 'SOIREE' },
  { id: 5, code: 'EPA5SD', nom: 'CINEMA' }
]);

const codeCopieId = ref(null);
const modaleOuverte = ref(false);
const nouveauNomSalon = ref('');

const copierCode = async (salon) => {
  try {
    await navigator.clipboard.writeText(salon.code);
    codeCopieId.value = salon.id;
    setTimeout(() => {
      codeCopieId.value = null;
    }, 1800);
  } catch (err) {
    console.error('Erreur lors de la copie :', err);
  }
};

const ouvrirModale = () => {
  nouveauNomSalon.value = '';
  modaleOuverte.value = true;
};

</script>