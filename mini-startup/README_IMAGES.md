# Изображения в проекте

## Структура папок

```
SaaS/
├── public/              # Статические файлы (favicon, opengraph)
├── src/
│   └── assets/
│       └── images/      # Изображения для компонентов
```

## Как скопировать изображения из Service-Flow

1. **Открой папку Service-Flow:**
   ```
   C:\Users\Professional\Desktop\Service-Flow\Service-Flow\
   ```

2. **Скопируй изображения:**
   - Из `attached_assets/generated_images/` скопируй:
     - `elegant_modern_salon_interior_background.png` → `src/assets/images/`
     - `minimal_abstract_hero_background.png` → `src/assets/images/`

3. **Из `client/public/` скопируй:**
   - `favicon.png` → `public/`
   - `opengraph.jpg` → `public/`

## Использование в коде

После копирования изображений, раскомментируй импорты в компонентах:

```tsx
import heroBg from '@assets/images/elegant_modern_salon_interior_background.png'
```

## Алиасы настроены

- `@assets` → `src/assets`
- Используй: `@assets/images/filename.png`

