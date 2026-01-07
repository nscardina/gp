import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
    base: "/gp/",
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                howToPlay: resolve(__dirname, "how_to_play/index.html")
            },
            output: {
                format: "es"
            }
        },
        target: "esnext"
    },
    worker: {
        format: "es"
    }
})