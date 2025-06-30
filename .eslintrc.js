module.exports = {
	root: true,
	env: {
		browser: true,
		es2022: true,
		node: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['@typescript-eslint', 'import', 'prettier'],
	rules: {
		// TypeScript-specific rules
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
			},
		],
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-non-null-assertion': 'warn',
		'@typescript-eslint/no-var-requires': 'error',
		'prettier/prettier': 'error',
		// Import rules
		'import/order': [
			'error',
			{
				groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
		'import/no-duplicates': 'error',
		'import/no-unresolved': 'off', // Handled by TypeScript

		// General JavaScript rules
		'no-console': 'off', // Allow console logs for debugging
		'no-debugger': 'error',
		'no-alert': 'error',
		'no-var': 'error',
		'prefer-const': 'error',
		'prefer-arrow-callback': 'error',
		'arrow-spacing': 'error',
		'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
		'eol-last': 'error',
		'comma-dangle': ['error', 'always-multiline'],
		semi: ['error', 'never'],
		quotes: ['error', 'single', { avoidEscape: true }],
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'object-curly-spacing': ['error', 'always'],
		'array-bracket-spacing': ['error', 'never'],
		'space-before-function-paren': [
			'error',
			{ anonymous: 'always', named: 'never', asyncArrow: 'always' },
		],

		// Code quality rules
		'no-unused-expressions': 'error',
		'no-unused-labels': 'error',
		'no-unreachable': 'error',
		'no-fallthrough': 'error',
		'no-duplicate-case': 'error',
		'no-empty': 'error',
		curly: ['error', 'all'],
		'default-case': 'error',
		eqeqeq: ['error', 'always'],
		'guard-for-in': 'error',
		'no-caller': 'error',
		'no-extend-native': 'error',
		'no-extra-bind': 'error',
		'no-invalid-this': 'error',
		'no-multi-spaces': 'error',
		'no-new': 'error',
		'no-throw-literal': 'error',
		'no-with': 'error',
	},
	ignorePatterns: [
		'dist/',
		'node_modules/',
		'*.min.js',
		'webpack.config.js',
		'postcss.config.js',
	],
	overrides: [
		{
			files: ['*.ts'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/no-require-imports': 'off',
			},
		},
	],
}
