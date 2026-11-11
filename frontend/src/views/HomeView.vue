<template>
  <div class="container my-auto py-5" style="max-width: 640px;">
    
    <div class="text-center mb-5">
      <h1 class="fw-bold text-white fs-3 mb-2">Avec Watch4Ever, regardez des vidéos ensemble.</h1>
      <p class="text-muted small">Synchronisation vidéo instantanée avec vos amis.</p>
    </div>

    <div class="clean-card p-4">
      
      <div class="mb-4 pb-4 border-bottom border-secondary border-opacity-25">
        <label class="form-label text-white fw-semibold small mb-1">Nouveau salon</label>
        <p class="text-muted small mb-3">Créez un salon privé et partagez le lien généré.</p>
        <button class="btn btn-primary fw-semibold w-100 py-2">
          Créer un salon
        </button>
      </div>

      <div>
        <label class="form-label text-white fw-semibold small mb-3">Rejoindre un salon</label>
        
        <form class="d-flex gap-2">
          <input type="text" class="form-control form-control-lg fs-6" placeholder="Ex: X9A2B"maxlength="10"required>
          <button type="submit" class="btn btn-secondary text-white fw-semibold px-4">
            Rejoindre
          </button>
        </form>
      </div>

    </div>

  </div>
</template>

<script setup>

</script>