// Centralized frontend entity labels and export UI configuration.
// Provides default values and a small runtime API to override or load from server.

const defaultUI = {
  pendingAssignment: 'Pending',
  provideJustificationPlaceholder: 'Enter justification for your review...',
  unknownReviewer: 'Unknown'
}

const defaultExportUI = {
  schemaLabel: 'Institutional Schema',
  formatsLabel: 'CSV, JSON'
}

let UI_LABELS = { ...defaultUI }
let EXPORT_UI = { ...defaultExportUI }

export function setFrontendEntities({ uiLabels, exportUi } = {}) {
  if (uiLabels) UI_LABELS = { ...UI_LABELS, ...uiLabels }
  if (exportUi) EXPORT_UI = { ...EXPORT_UI, ...exportUi }
}

export async function loadFrontendEntitiesFromServer(url = '/api/frontend-config') {
  try {
    const res = await fetch(url, { credentials: 'same-origin' })
    if (!res.ok) return
    const json = await res.json()
    setFrontendEntities({ uiLabels: json.UI_LABELS, exportUi: json.EXPORT_UI })
  } catch (e) {
    // silent fallback to defaults
  }
}

export { UI_LABELS, EXPORT_UI }
