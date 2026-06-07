/**
 * Shared constants for the standalone video course. Kept out of the
 * "use server" actions file (which may only export async functions) so both
 * server and client modules can import them.
 */

/** Private Supabase Storage bucket holding the course video files. */
export const COURSE_VIDEO_BUCKET = "course-videos";

/** Course identifier (slug) for the arabic-reading course. */
export const ARABIC_COURSE_SLUG = "arabic_course";
