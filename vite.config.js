import { defineConfig } from "vite"

export default defineConfig({
    base: "/gp/",
    build: {
        sourcemap: true,
        rollupOptions: {
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