# Translation System for Prayer Cycle

This project uses vue-i18n for internationalization and is configured to work with Weblate for crowdsourced translations.

## Setup

The translation system supports 50 languages and uses JSON files for translation storage.

### Directory Structure

```
src/
├── i18n/
│   ├── index.ts          # Main i18n configuration
│   └── locales/
│       ├── en.json       # Base English translations
│       ├── es.json       # Spanish translations (managed by Weblate)
│       ├── fr.json       # French translations (managed by Weblate)
│       └── ...           # Other language files
├── composables/
│   └── useI18n.ts        # Translation composable utility
└── components/
    └── LanguageSelector.vue  # Language selection component
```

## Weblate Integration

### Configuration Files

- `.weblate` - Weblate project configuration
- `.github/workflows/weblate.yml` - GitHub Actions for translation validation

### Supported Languages

The system supports languages matching the Zume Training System language codes:
- English (en_US) - Base language
- Spanish (es, es_ES), French (fr_FR), German (de_DE), Portuguese (pt, pt_PT), Italian (it_IT)
- Russian (ru_RU), Japanese (ja), Korean (ko_KR)
- Arabic (ar, ar_JO, ar_MA, ar_TN), Hindi (hi_IN), Bengali (bn_IN), Persian (fa_IR)
- And 35+ more languages with proper country/region variants...

### Setting Up Weblate

1. **Create Weblate Project**
   - Go to [Weblate](https://weblate.org/)
   - Create new project: "Prayer Cycle"
   - Add component: "Main Interface"

2. **Configure Component**
   - File format: JSON
   - File mask: `src/i18n/locales/*.json`
   - Base file: `src/i18n/locales/en_US.json`
   - Template: `src/i18n/locales/en_US.json`

3. **Repository Integration**
   - Connect GitHub repository
   - Set up webhook for automatic sync
   - Configure branch: `master`

### Translation Workflow

1. **Developer Updates**
   - Add new translation keys to `src/i18n/locales/en_US.json`
   - Commit and push changes
   - Weblate automatically detects new strings

2. **Translator Workflow**
   - Translators use Weblate interface
   - Changes are automatically committed to repository
   - GitHub Actions validate translation files

3. **Deployment**
   - Translations are included in build automatically
   - Users can switch languages via language selector

## Usage

### In Components

```vue
<template>
  <div>
    <h1>{{ t('app.title') }}</h1>
    <p>{{ t('welcome.description') }}</p>
  </div>
</template>

<script setup>
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>
```

### Language Switching

```vue
<template>
  <LanguageSelector />
</template>

<script setup>
import LanguageSelector from '@/components/LanguageSelector.vue'
</script>
```

### Programmatic Language Change

```javascript
import { useI18n } from '@/composables/useI18n'

const { changeLanguage } = useI18n()

// Switch to French
await changeLanguage('fr_FR')
```

## Translation Keys Structure

```json
{
  "app": {
    "title": "Prayer Cycle",
    "description": "A 60-minute guided prayer experience"
  },
  "prayer": {
    "steps": {
      "praise": {
        "name": "PRAISE",
        "description": "Start your prayer hour by praising the Lord..."
      }
    },
    "timer": {
      "start": "Start",
      "pause": "Pause",
      "next": "Next Step"
    }
  },
  "settings": {
    "language": {
      "title": "Language",
      "description": "Choose your preferred language"
    }
  }
}
```

## Development Guidelines

### Adding New Translation Keys

1. Add the key to `src/i18n/locales/en_US.json`
2. Use the key in your component: `{{ t('your.new.key') }}`
3. Commit changes - Weblate will pick up new strings automatically

### Translation Key Naming

- Use nested objects for organization
- Use descriptive, hierarchical keys
- Follow existing patterns:
  - `app.*` - Application-wide strings
  - `prayer.*` - Prayer-related content
  - `settings.*` - Settings interface
  - `common.*` - Shared UI elements

### Best Practices

1. **Pluralization**: Use vue-i18n pluralization features
2. **Variables**: Use named parameters: `"welcome": "Hello {name}!"`
3. **Context**: Provide context in key names when meaning could be ambiguous
4. **Fallbacks**: Always provide English fallback text

## Testing Translations

```bash
# Build project (includes translation validation)
npm run build

# Run tests
npm run test:unit

# Validate JSON syntax
npm run validate-translations
```

## Troubleshooting

### Common Issues

1. **JSON Syntax Errors**
   - Check JSON validity in translation files
   - GitHub Actions will flag syntax errors

2. **Missing Translation Keys**
   - Keys not found will display the key name
   - Check console for missing key warnings

3. **Dynamic Import Warnings**
   - Build warnings are normal for lazy-loaded translations
   - Does not affect functionality

### Manual Translation File Creation

If needed, create language files manually:

```bash
# Create new language file
cp src/i18n/locales/en_US.json src/i18n/locales/[language-code].json
```

Then translate the content and add the language to `SUPPORTED_LANGUAGES` in `src/i18n/index.ts`.