<template>
  <div class="language-selector">
    <select 
      v-model="selectedLanguage"
      @change="handleLanguageChange"
      class="language-selector__select"
      :aria-label="t('settings.language.title')"
    >
      <option 
        v-for="language in supportedLanguages" 
        :key="language.code"
        :value="language.code"
      >
        {{ language.nativeName }} ({{ language.name }})
      </option>
    </select>
    <div class="language-selector__icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t, currentLanguage, supportedLanguages, changeLanguage } = useI18n()

const selectedLanguage = ref(currentLanguage.value)

// Watch for external language changes
watch(currentLanguage, (newLanguage) => {
  selectedLanguage.value = newLanguage
})

const handleLanguageChange = async () => {
  if (selectedLanguage.value !== currentLanguage.value) {
    await changeLanguage(selectedLanguage.value)
  }
}
</script>

<style scoped>
.language-selector {
  position: relative;
  display: inline-block;
}

.language-selector__select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-color: #ffffff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #374151;
  cursor: pointer;
  min-width: 200px;
  transition: all 0.2s ease-in-out;
}

.language-selector__select:hover {
  border-color: #cbd5e1;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.language-selector__select:focus {
  outline: none;
  border-color: #2cace2;
  box-shadow: 0 0 0 3px rgba(44, 172, 226, 0.1);
}

.language-selector__icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .language-selector__select {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .language-selector__select:hover {
    border-color: #6b7280;
  }

  .language-selector__icon {
    color: #9ca3af;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .language-selector__select {
    min-width: 150px;
    font-size: 0.9rem;
    padding: 0.625rem 2rem 0.625rem 0.75rem;
  }
}
</style>