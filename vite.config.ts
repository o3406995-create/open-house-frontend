import fs from "fs"
import path from "path"
import { defineConfig, type UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

function readEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {}

  const values: Record<string, string> = {}
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }
  return values
}

function envFileForMode(mode: string): string {
  if (mode === "dev") return "dev.env"
  if (mode === "sit") return "sit.env"
  if (mode === "uat") return "uat.env"
  return "local.env"
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileValues = readEnvFile(path.resolve(import.meta.dirname, "env", envFileForMode(mode)))
  const processValues = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] =>
        entry[0].startsWith("VITE_") && typeof entry[1] === "string",
    ),
  )
  const env = { ...fileValues, ...processValues }
  const define = Object.fromEntries(
    Object.entries(env)
      .filter(([key]) => key.startsWith("VITE_"))
      .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  )

  const config: UserConfig = {
    envDir: path.resolve(import.meta.dirname, "env"),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    define,
  }
  return config
})
