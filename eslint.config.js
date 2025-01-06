import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default {
    ignores: ['dist'], // Ignorer certains dossiers
    files: ['**/*.{ts,tsx,js,jsx}'], // Cibler les fichiers TS/JS
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tsParser,
        globals: {
            ...globals.browser
        }
    },
    plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
        '@typescript-eslint': tseslint
    },
    rules: {
        // Points-virgules obligatoires
        semi: ['error', 'always'],
        // Guillemets simples
        quotes: ['error', 'single', { avoidEscape: true }],
        // Pas d'espace inutile avant les parenthèses
        'space-before-function-paren': ['error', 'never'],
        // Pas de trailing commas
        'comma-dangle': ['error', 'never'],
        // Utilisation stricte des triples égales (===)
        eqeqeq: ['error', 'always'],

        // Règles pour React Hooks
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true }
        ]
    },
    settings: {
        react: {
            version: 'detect'
        }
    }
};