const { execFileSync } = require("node:child_process")
const { existsSync, readFileSync, copyFileSync, mkdirSync, rmSync } = require("node:fs")
const { join } = require("node:path")

function ensureEnvFile() {
  const envPath = join(process.cwd(), ".env")
  const examplePath = join(process.cwd(), ".env.example")

  if (!existsSync(envPath) && existsSync(examplePath)) {
    console.log("⚙️  Creating default .env from .env.example...")
    copyFileSync(examplePath, envPath)
  }

  const uploadsDir = join(process.cwd(), "public", "uploads")
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true })
  }
}

function readPort() {
  const envPath = join(process.cwd(), ".env")

  if (!existsSync(envPath)) {
    return "3000"
  }

  const env = readFileSync(envPath, "utf8")
  const match = env.match(/^PORT\s*=\s*"?([^"\r\n]+)"?/m)

  return match?.[1]?.trim() || "3000"
}

function findWindowsListeners(port) {
  const output = execFileSync("netstat", ["-ano"], { encoding: "utf8" })
  const listeners = new Set()

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes("LISTENING")) {
      continue
    }

    const parts = line.trim().split(/\s+/)
    const localAddress = parts[1]
    const pid = parts[parts.length - 1]

    if (localAddress?.endsWith(`:${port}`) && /^\d+$/.test(pid)) {
      listeners.add(pid)
    }
  }

  return [...listeners]
}

function findUnixListeners(port) {
  try {
    const output = execFileSync("lsof", ["-ti", `tcp:${port}`], {
      encoding: "utf8",
    })

    return output
      .split(/\r?\n/)
      .map((pid) => pid.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function stopListeners(port) {
  const pids =
    process.platform === "win32"
      ? findWindowsListeners(port)
      : findUnixListeners(port)

  for (const pid of pids) {
    if (pid === String(process.pid)) {
      continue
    }

    console.log(`Stopping existing dev server on port ${port} (PID ${pid})`)

    try {
      if (process.platform === "win32") {
        execFileSync("taskkill", ["/PID", pid, "/F"], { stdio: "inherit" })
      } else {
        execFileSync("kill", ["-TERM", pid], { stdio: "inherit" })
      }
    } catch {
      console.error(
        `Could not stop PID ${pid}. Close the old dev server terminal, or run: taskkill /PID ${pid} /F`
      )
      process.exit(1)
    }
  }
}

function removeStaleLock() {
  const lockPath = join(process.cwd(), ".next", "dev", "lock")

  if (!existsSync(lockPath)) {
    return
  }

  try {
    rmSync(lockPath, { force: true })
  } catch {
    // Lock file handle ignored if process is active
  }
}

ensureEnvFile()
const port = readPort()
stopListeners(port)
removeStaleLock()
