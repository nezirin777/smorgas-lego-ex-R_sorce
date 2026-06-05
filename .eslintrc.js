module.exports = {
    "parser": "@babel/eslint-parser",
    "parserOptions": {
      "sourceType": "script",
      "requireConfigFile": false,
      "allowImportExportEverywhere": false,
      "codeFrame": false,
      "ecmaVersion": 2020
    },
    "env": {
      "browser": true,
      "es6": true
    },
    "extends": "eslint:recommended",
    "rules": {
      "no-console": "off",
      "no-irregular-whitespace": "off",
      "no-unused-vars": "warn",
      "no-extra-boolean-cast": "warn",
      "no-mixed-spaces-and-tabs": "off",
      "no-useless-escape": "off"
    }
};
