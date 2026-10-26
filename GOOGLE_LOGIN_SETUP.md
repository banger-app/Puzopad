# ПУЗОПАД: подключение кнопки «Продолжить с Google»

## Почему кнопка пока не работает
Supabase Auth возвращает `400 Unsupported provider: provider is not enabled`.
Это конфигурация провайдера в Supabase, а не ошибка iPhone или Google-аккаунта.

## Подключение
1. Открой [Google Auth Platform](https://console.cloud.google.com/auth/overview) и создай (или выбери) Google Cloud проект. Настрой Branding и Audience. Для публичного входа убедись, что приложение доступно нужным пользователям, а не только тестовым аккаунтам.
2. В разделе [Google OAuth Clients](https://console.cloud.google.com/auth/clients) создай OAuth Client типа **Web application**:
   - Authorized JavaScript origins: `https://banger-app.github.io`
   - Authorized redirect URI: `https://wsgkqauwukykhmhtinoa.supabase.co/auth/v1/callback`
3. В [Supabase → Authentication → Sign In / Providers → Google](https://supabase.com/dashboard/project/wsgkqauwukykhmhtinoa/auth/providers?provider=Google) включи Google. Вставь Client ID и Client Secret из Google Cloud **в панели Supabase, не в чат и не в GitHub**.
4. В [Supabase → Authentication → URL Configuration](https://supabase.com/dashboard/project/wsgkqauwukykhmhtinoa/auth/url-configuration) разреши redirect URL `https://banger-app.github.io/Puzopad/`. Site URL тоже можно установить на этот постоянный адрес, если он основной.
5. Открой `https://banger-app.github.io/Puzopad/` повторно. Версия v60 автоматически запрашивает `/auth/v1/settings` и включает кнопку Google только когда `external.google=true`.
6. Проверь вход в Safari и установленной веб-версии на iPhone: Google OAuth и PWA могут обрабатывать возврат на сайт по-разному.

**Важно:** не вводи пароль от Google в поля «Email / Пароль» ПУЗОПАДА. Это отдельная email/пароль авторизация Supabase.

Официальный справочник: https://supabase.com/docs/guides/auth/social-login/auth-google
