# GK Network — Frontend

React + Vite + Tailwind CSS, Cherry qizil tema.

## O'rnatish

```bash
npm install
npm run dev
```

## Papka tuzilmasi

```
src/
├── components/
│   ├── ui/          # Qayta ishlatiladigan UI komponentlar
│   └── layout/      # Layout, Sidebar, Header
├── pages/
│   ├── auth/        # Login
│   ├── dashboard/   # Bosh sahifa
│   ├── clients/     # Mijozlar ro'yxati va detail
│   ├── properties/  # Ob'yektlar ro'yxati va detail
│   └── leads/       # Lidlar
├── services/
│   └── api.js       # Axios + barcha API chaqiruvlar
├── store/
│   └── authStore.js # Zustand auth store
├── utils/
│   └── helpers.js   # Formatters, constants
└── styles/
    └── global.css   # Tailwind + custom classes
```

## Rang palitasi (Cherry tema)

| Rang        | Hex      | Ishlatilishi        |
|-------------|----------|---------------------|
| cherry-900  | #4a0000  | Sidebar, topbar     |
| cherry-800  | #7b0000  | Sidebar bg          |
| cherry-700  | #c62828  | Tugmalar, accent    |
| cherry-100  | #ffebee  | Avatarlar, bg       |
| cherry-50   | #fff5f5  | Card hover, badge   |

## Backend bilan ulash

`.env` faylida `VITE_API_URL` o'rnating yoki
`vite.config.js` dagi proxy ni backend URL ga o'zgartiring.

## Dependencies

- react-router-dom: Routing
- axios: HTTP client
- zustand: State management
- react-hot-toast: Notifications
- lucide-react: Ikonkalar
- clsx: Conditional classnames
- tailwindcss: Styling
