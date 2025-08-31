import i18n from 'react-i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: {
    'nav.home':'Home', 'nav.premium':'Premium', 'nav.friends':'Friends', 'nav.top':'Top', 'nav.info':'Information',
    'home.balance':'Balance', 'home.rate':'Rate', 'home.tap':'Tap the coin to earn FRANKCOIN!',
    'premium.title':'Premium Membership', 'premium.copy':'Unlock x5 speed and 12h Auto-Click.',
    'premium.month':'month', 'premium.speed':'speed', 'premium.autoclick':'Auto-Click', 'premium.buy':'Buy for 4 TON',
    'friends.title':'Invite friends', 'friends.copy':'Share your link and get 15,000 coins + 10% of referral earnings.',
    'friends.copylink':'Copy link', 'friends.invites':'Invites', 'friends.earned':'Referral coins',
    'leaderboard.title':'Top Players', 'top.global':'Global', 'top.weekly':'Weekly', 'top.today':'Today'
  }},
  de: { translation: {
    'nav.home':'Start', 'nav.premium':'Premium', 'nav.friends':'Freunde', 'nav.top':'Top', 'nav.info':'Info',
    'home.balance':'Guthaben', 'home.rate':'Rate', 'home.tap':'Tippe auf die Münze!',
    'premium.title':'Premium-Mitgliedschaft', 'premium.copy':'Schalte x5 Speed und 12h Auto-Click frei.',
    'premium.month':'Monat', 'premium.speed':'Geschwindigkeit', 'premium.autoclick':'Auto-Click', 'premium.buy':'Für 4 TON kaufen',
    'friends.title':'Freunde einladen', 'friends.copy':'Teile den Link und erhalte 15.000 Münzen + 10% Einkommen.',
    'friends.copylink':'Link kopieren', 'friends.invites':'Einladungen', 'friends.earned':'Referral-Münzen',
    'leaderboard.title':'Top Spieler', 'top.global':'Global', 'top.weekly':'Wöchentlich', 'top.today':'Heute'
  }},
  uk: { translation: {
    'nav.home':'Головна', 'nav.premium':'Premium', 'nav.friends':'Друзі', 'nav.top':'Топ', 'nav.info':'Інформація',
    'home.balance':'Баланс', 'home.rate':'Швидкість', 'home.tap':'Тицяй монетку, щоб заробляти!',
    'premium.title':'Преміум', 'premium.copy':'Відкрий x5 швидкість та 12 годин авто-клік.',
    'premium.month':'місяць', 'premium.speed':'швидкість', 'premium.autoclick':'Автоклік', 'premium.buy':'Купити за 4 TON',
    'friends.title':'Запроси друзів', 'friends.copy':'Ділись лінком і отримуй 15 000 монет + 10% заробітку.',
    'friends.copylink':'Скопіювати', 'friends.invites':'Запрошень', 'friends.earned':'Реферальні монети',
    'leaderboard.title':'Топ гравців', 'top.global':'Глобальний', 'top.weekly':'Тижневий', 'top.today':'Сьогодні'
  }},
  ru: { translation: {
    'nav.home':'Главная', 'nav.premium':'Премиум', 'nav.friends':'Друзья', 'nav.top':'Топ', 'nav.info':'Инфо',
    'home.balance':'Баланс', 'home.rate':'Скорость', 'home.tap':'Нажимай на монету, чтобы зарабатывать!',
    'premium.title':'Премиум', 'premium.copy':'Открой x5 скорость и 12ч авто-клик.',
    'premium.month':'месяц', 'premium.speed':'скорость', 'premium.autoclick':'Автоклик', 'premium.buy':'Купить за 4 TON',
    'friends.title':'Пригласи друзей', 'friends.copy':'Делись ссылкой и получай 15 000 монет + 10% заработка.',
    'friends.copylink':'Копировать', 'friends.invites':'Приглашения', 'friends.earned':'Реферальные монеты',
    'leaderboard.title':'Топ игроков', 'top.global':'Глобальный', 'top.weekly':'Недельный', 'top.today':'Сегодня'
  }}
};

const instance = i18n.default || i18n;
instance
  .use(initReactI18next)
  .init({
    resources, lng: 'en', fallbackLng: 'en', interpolation: { escapeValue: false }
  });

export default instance;
