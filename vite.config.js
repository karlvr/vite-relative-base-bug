/** @type {import('vite7').UserConfig} */
export default {
	base: './',
	build: {
		assetsInlineLimit: 0,
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: 'entrypoints/main.html',
			},
			output: {
				assetFileNames(chunkInfo) {
					const name = chunkInfo.name ?? ''
					if (name.endsWith('.css')) {
						return 'css/[name]-[hash].[ext]'
					}
					if (name.match(/\.(png|jpe?g|gif|svg|webp)$/)) {
						return 'img/[name]-[hash].[ext]'
					}
					return '[name]-[hash].[ext]'
				},
			},
		},
	},
}
