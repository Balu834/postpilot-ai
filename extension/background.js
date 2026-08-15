const MENU_ID = "postpilot-send-selection"

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id:       MENU_ID,
    title:    "Send selection to PostPilot AI",
    contexts: ["selection"],
  })
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.selectionText) return

  await chrome.storage.local.set({ pendingCapture: info.selectionText })

  // openPopup() requires a recent Chrome (127+) and a user gesture — the
  // context-menu click itself counts, but older Chrome versions don't
  // support the API at all, so fall back to a notification telling the
  // user to click the toolbar icon themselves. Either way the captured
  // text is already saved and picked up by popup.js on next open.
  try {
    await chrome.action.openPopup()
  } catch {
    chrome.notifications.create({
      type:    "basic",
      iconUrl: "icons/icon-128.png",
      title:   "Selection captured",
      message: "Click the PostPilot AI icon in your toolbar to save it as a draft.",
    })
  }
})
