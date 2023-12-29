module.exports = {
    locales:         [
        'default',
        'en',
    ],
    defaultLocale:   'default',
    localeDetection: true,
    pages:           {
        '*':                  ['common'],
        '/signin':            ['signin'],
        '/profile':           ['profile'],
        '/profile/order':     ['profile', 'order-status', 'order'],
        '/profile/order-add': ['order-add', 'profile'],
    },
};
