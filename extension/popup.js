import { CONFIG } from "./config.js"
import { login, logout, getSession } from "./auth.js"

const $ = (id) => document.getElementById(id)

const statusEl       = $("status")
const loginForm      = $("login-form")
const captureForm    = $("capture-form")
const loginSubmit    = $("login-submit")
const saveSubmit     = $("save-submit")

function showStatus(text, type) {
  statusEl.textContent = text
  statusEl.className = `status ${type}`
}
function clearStatus() {
  statusEl.className = "status hidden"
}

function showView(view) {
  loginForm.classList.toggle("hidden", view !== "login")
  captureForm.classList.toggle("hidden", view !== "capture")
}

async function prefillFromSelection() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func:   () => window.getSelection()?.toString() ?? "",
    })
    if (result) $("content").value = result
  } catch {
    // Restricted page (chrome://, Web Store, etc.) — no selection to read, not an error.
  }
}

async function init() {
  // A background capture (from the right-click menu) takes priority over
  // whatever's currently selected on the page.
  const { pendingCapture } = await chrome.storage.local.get("pendingCapture")

  const session = await getSession()
  if (!session) {
    showView("login")
    return
  }

  showView("capture")
  if (pendingCapture) {
    $("content").value = pendingCapture
    await chrome.storage.local.remove("pendingCapture")
  } else {
    await prefillFromSelection()
  }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  clearStatus()
  loginSubmit.disabled = true
  loginSubmit.textContent = "Signing in…"
  try {
    await login($("login-email").value, $("login-password").value)
    showView("capture")
    await prefillFromSelection()
  } catch (err) {
    showStatus(err.message || "Sign in failed", "error")
  } finally {
    loginSubmit.disabled = false
    loginSubmit.textContent = "Sign in"
  }
})

$("signout").addEventListener("click", async () => {
  await logout()
  clearStatus()
  showView("login")
})

captureForm.addEventListener("submit", async (e) => {
  e.preventDefault()
  clearStatus()

  const content = $("content").value.trim()
  if (!content) { showStatus("Add some content first.", "error"); return }

  const session = await getSession()
  if (!session) { showView("login"); return }

  saveSubmit.disabled = true
  saveSubmit.textContent = "Saving…"
  try {
    const res = await fetch(`${CONFIG.APP_URL}/api/drafts`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body:    JSON.stringify({
        platform: $("platform").value,
        content,
        topic: $("topic").value.trim() || undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to save draft")

    showStatus("Saved to Drafts ✓", "success")
    $("content").value = ""
    $("topic").value = ""
  } catch (err) {
    showStatus(err.message || "Something went wrong", "error")
  } finally {
    saveSubmit.disabled = false
    saveSubmit.textContent = "Save to Drafts"
  }
})

init()
