/**
 * ===================================================
 * STATIC DATA LOADERS
 * ===================================================
 * 
 * These functions load pre-fetched data from static JSON files.
 * Data is fetched at BUILD TIME by scripts/fetch-build-data.ts
 * 
 * NO SERVER ACTIONS
 * NO RUNTIME API CALLS
 * NO REDIS
 * NO DATABASE
 * 
 * Pure static data loading for Next.js static export.
 */

import githubData from '@/../../public/data/github.json'
import leetcodeData from '@/../../public/data/leetcode.json'
import mediumData from '@/../../public/data/medium.json'

/**
 * Get GitHub data from static JSON
 * This data was fetched at build time
 */
export function getGithubData() {
  return githubData
}

/**
 * Get LeetCode data from static JSON
 * This data was fetched at build time
 */
export function getLeetcodeData() {
  return leetcodeData
}

/**
 * Get Medium data from static JSON
 * This data was fetched at build time
 */
export function getMediumData() {
  return mediumData
}

// Type exports for TypeScript
export type GitHubData = typeof githubData
export type LeetCodeData = typeof leetcodeData
export type MediumData = typeof mediumData
