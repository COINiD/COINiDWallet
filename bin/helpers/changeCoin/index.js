#!/bin/node
const ticker = process.argv[2];

if (!ticker) {
  console.error('no ticker specified');
  process.exit();
}

const replace = require('replace-in-file');

const {
  availableCurrencies,
  coinName,
  appReturnScheme,
  iosIdentifier,
  androidPackageName,
  displayName,
  isTestnet,
} = require(`./coin_config/${ticker}/config.json`);

const doReplace = ({
  file, equalSign, quoteSign, breakSign, replacements, noSpacedEqual,
}) => {
  for (const key in replacements) {
    let to = `${key} ${equalSign} ${quoteSign}${replacements[key]}${quoteSign}`;
    if (noSpacedEqual) {
      to = `${key}${equalSign}${quoteSign}${replacements[key]}${quoteSign}`;
    }

    const options = {
      files: file,
      from: new RegExp(`${key} ?[${equalSign}][^${breakSign}]*`, 'g'),
      to,
    };

    const changes = replace.sync(options);
    console.log(`Modified ${key} in:`, changes.join(', '));
  }
};

// General
doReplace({
  file: 'src/config/settings.js',
  equalSign: ':',
  quoteSign: "'",
  breakSign: ',',
  replacements: {
    coin: coinName,
    appReturnScheme,
  },
});

// General
doReplace({
  file: 'src/config/settings.js',
  equalSign: ':',
  quoteSign: '',
  breakSign: '\n',
  replacements: {
    availableCurrencies: `${availableCurrencies},`,
    isTestnet: `${isTestnet},`,
  },
});

// IOS
doReplace({
  file: 'ios/COINiDWallet.xcodeproj/project.pbxproj',
  equalSign: '=',
  quoteSign: '"',
  breakSign: ';',
  replacements: {
    PRODUCT_BUNDLE_IDENTIFIER: iosIdentifier,
    PRODUCT_NAME: displayName,
    APP_RETURN_SCHEME: appReturnScheme,
  },
});

doReplace({
  file: 'ios/fastlane/Appfile',
  equalSign: '(',
  quoteSign: '"',
  breakSign: ')',
  replacements: {
    app_identifier: iosIdentifier,
  },
});

doReplace({
  file: 'android/app/build.gradle',
  equalSign: ' ',
  quoteSign: '"',
  breakSign: '\n',
  noSpacedEqual: true,
  replacements: {
    applicationId: androidPackageName,
  },
});

doReplace({
  file: 'android/app/src/main/AndroidManifest.xml',
  equalSign: '=',
  quoteSign: '"',
  breakSign: '\n',
  noSpacedEqual: true,
  replacements: {
    package: androidPackageName,
  },
});

doReplace({
  file: 'android/app/src/main/java/org/coinid/wallet/MainActivity.java',
  equalSign: ' ',
  quoteSign: '',
  breakSign: ';',
  noSpacedEqual: true,
  replacements: {
    package: androidPackageName,
  },
});

doReplace({
  file: 'android/app/src/main/java/org/coinid/wallet/MainApplication.java',
  equalSign: ' ',
  quoteSign: '',
  breakSign: ';',
  noSpacedEqual: true,
  replacements: {
    package: androidPackageName,
  },
});

doReplace({
  file: 'android/app/build.gradle',
  equalSign: ':',
  quoteSign: '"',
  breakSign: ',',
  replacements: {
    appReturnScheme: appReturnScheme,
  },
});

doReplace({
  file: 'android/fastlane/Appfile',
  equalSign: '(',
  quoteSign: '"',
  breakSign: ')',
  replacements: {
    package_name: androidPackageName,
  },
});

// Android
