import { defineConfig } from 'vite';

export default defineConfig({
	root: '.',
	publicDir: 'public',
	server: {
		port: 3000,
		open: true
	},
	resolve: {
		alias: {
			'@': '/src',
			'@core': '/src/core',
			'@types': '/src/types',
			'@data': '/src/data',
			'@pedagogy': '/src/pedagogy',
			'@narrative': '/src/narrative',
			'@dnd/types': '/src/types',
			'@utils': '/src/utils'
		}
	},
	build: {
		outDir: 'dist',
		sourcemap: true
	}
});
