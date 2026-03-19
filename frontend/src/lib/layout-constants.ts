/**
 * Layout constants for the left pane. Keep these in sync so the fixed
 * FileUpload never overlaps the scrollable text area.
 *
 * Calculation: main padding-bottom must >= (BottomBar height + gap + FileUpload height + gap)
 * - BottomBar: ~56px
 * - Gap to FileUpload: 24px
 * - FileUpload height: ~260px (min-h + padding)
 * - Gap above FileUpload (text separation): 24px
 * = 52 + 24 + 260 + 24 = 360px, use 370px for safety
 */
export const BOTTOM_BAR_HEIGHT_PX = 60; /* py-3 (24px) + h-9 (36px) */
export const UPLOAD_ZONE_GAP_PX = 24;
export const UPLOAD_ZONE_HEIGHT_PX = 270; /* min-h-[220px] + py-6 + content; use 270 for safety */
export const TEXT_TO_UPLOAD_GAP_PX = 24;

/** Padding-bottom for main when idle: reserves space so text never scrolls under FileUpload */
export const MAIN_PADDING_BOTTOM_IDLE_PX =
  BOTTOM_BAR_HEIGHT_PX +
  UPLOAD_ZONE_GAP_PX +
  UPLOAD_ZONE_HEIGHT_PX +
  TEXT_TO_UPLOAD_GAP_PX +
  10; /* safety buffer */

/** FileUpload fixed bottom offset (above BottomBar) */
export const UPLOAD_ZONE_BOTTOM_PX = BOTTOM_BAR_HEIGHT_PX + UPLOAD_ZONE_GAP_PX;

/** Padding-bottom for main when text is shown (no FileUpload): 24px gap above BottomBar */
export const MAIN_PADDING_BOTTOM_WITH_TEXT_PX = BOTTOM_BAR_HEIGHT_PX + UPLOAD_ZONE_GAP_PX;
