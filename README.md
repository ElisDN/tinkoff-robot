# Робот Тинькофф Инвестиций

Пример робота на языке TypeScript с интерфейсом на React

## Установка и запуск

Откройте два окна терминала. В первом запустите робота:

```
cd robot
npm i
cp .env.example .env

# В файле .env укажите TINKOFF_TOKEN

npm run start
```

Во втором окне запустите пользовательский интерфейс:

```
cd frontend
npm i
cp .env.example .env

npm run start
```

В браузере перейдите по адресу `http://localhost:3000`
