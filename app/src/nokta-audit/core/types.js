// @ts-check
/**
 * @typedef {'open' | 'fixed'} AuditNoteStatus
 */

/**
 * @typedef {Object} AuditNoteBounds
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {Object} AuditNote
 * @property {string} id
 * @property {string} screenName
 * @property {string} screenshot
 * @property {number} [screenshotAspect]
 * @property {AuditNoteBounds | null} highlightBounds
 * @property {string} note
 * @property {AuditNoteStatus} status
 * @property {string} timestamp
 * @property {string} [reporterRole]
 * @property {string} [reporterId]
 */

/**
 * @typedef {Object} AuditReportMeta
 * @property {string} appName
 * @property {string} exportedAt
 * @property {number} totalNotes
 */

/**
 * @typedef {Object} AuditStorage
 * @property {() => Promise<AuditNote[]>} loadNotes
 * @property {(notes: AuditNote[]) => Promise<void>} saveNotes
 */

export {};
