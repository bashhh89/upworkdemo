import fs from 'fs/promises';
import path from 'path';
import { AgentConfiguration } from '@/types/agent';

// Define the path to the JSON file relative to the project root
const agentsFilePath = path.resolve(process.cwd(), 'agents.json');

/**
 * Reads agent configurations from the JSON file.
 * If the file doesn't exist, returns an empty array.
 * @returns {Promise<AgentConfiguration[]>} A promise that resolves to the array of agents.
 */
export async function readAgentsFromFile(): Promise<AgentConfiguration[]> {
  console.log(`Attempting to read agents from: ${agentsFilePath}`);
  try {
    const fileData = await fs.readFile(agentsFilePath, 'utf-8');
    const agents = JSON.parse(fileData) as AgentConfiguration[];
    console.log(`Successfully read ${agents.length} agents from file.`);
    // Optional: Validate data structure here if needed
    return agents;
  } catch (error: any) {
    // If the file doesn't exist, return an empty array (initial state)
    if (error.code === 'ENOENT') {
      console.log('agents.json not found. Returning empty array.');
      return [];
    } else {
      // For other errors (e.g., invalid JSON), log and throw or return empty
      console.error('Error reading agents file:', error);
      // Depending on desired behavior, you might want to throw the error
      // or return an empty array to prevent application crash.
      // For now, let's return empty to allow the app to potentially recover.
      // throw error; 
      return []; 
    }
  }
}

/**
 * Writes the provided array of agent configurations to the JSON file.
 * Overwrites the existing file content.
 * @param {AgentConfiguration[]} agents The array of agents to write.
 * @returns {Promise<void>} A promise that resolves when writing is complete.
 */
export async function writeAgentsToFile(agents: AgentConfiguration[]): Promise<void> {
  console.log(`Attempting to write ${agents.length} agents to: ${agentsFilePath}`);
  try {
    const jsonData = JSON.stringify(agents, null, 2); // Pretty-print JSON
    await fs.writeFile(agentsFilePath, jsonData, 'utf-8');
    console.log('Successfully wrote agents to file.');
  } catch (error) {
    console.error('Error writing agents file:', error);
    // Rethrow the error to be handled by the caller (e.g., the API route)
    throw error;
  }
}

/**
 * Splits text into overlapping chunks.
 * @param text The input text to chunk.
 * @param chunkSize The size of each chunk (in characters).
 * @param overlap The number of characters to overlap between chunks.
 * @returns Array of text chunks.
 */
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 100): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += chunkSize - overlap;
  }
  return chunks;
} 