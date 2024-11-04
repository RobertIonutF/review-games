'use server'

import db from '@/db'
import { gamesTable, thoughtsTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

type Mood = 'Happy' | 'Dissatisfied' | 'Neutral'

export async function getGames() {
  return await db.select().from(gamesTable)
}

export async function getThoughtsByGameId(gameId: number) {
  const thoughts = await db
    .select()
    .from(thoughtsTable)
    .where(eq(thoughtsTable.gameId, gameId))
    .orderBy(thoughtsTable.timestamp)

  return thoughts.map(thought => ({
    id: thought.id,
    content: thought.content,
    timestamp: thought.timestamp.toLocaleString(),
    mood: thought.mood as Mood
  }))
}

export async function addGame(name: string) {
  const [newGame] = await db
    .insert(gamesTable)
    .values({ name })
    .returning()
  return newGame
}

export async function addThought(gameId: number, content: string, mood: Mood) {
  const [newThought] = await db
    .insert(thoughtsTable)
    .values({ gameId, content, mood })
    .returning()

  return {
    id: newThought.id,
    content: newThought.content,
    timestamp: newThought.timestamp.toLocaleString(),
    mood: newThought.mood as Mood
  }
}

export async function updateGame(id: number, name: string) {
  const [updatedGame] = await db
    .update(gamesTable)
    .set({ name })
    .where(eq(gamesTable.id, id))
    .returning()
  return updatedGame
}

export async function deleteGame(id: number) {
  // Delete associated thoughts first
  await db
    .delete(thoughtsTable)
    .where(eq(thoughtsTable.gameId, id))

  // Then delete the game
  await db
    .delete(gamesTable)
    .where(eq(gamesTable.id, id))
}

export async function updateThought(id: number, content: string, mood: Mood) {
  const [updatedThought] = await db
    .update(thoughtsTable)
    .set({ content, mood })
    .where(eq(thoughtsTable.id, id))
    .returning()

  return {
    id: updatedThought.id,
    content: updatedThought.content,
    timestamp: updatedThought.timestamp.toLocaleString(),
    mood: updatedThought.mood as Mood
  }
}

export async function deleteThought(id: number) {
  await db
    .delete(thoughtsTable)
    .where(eq(thoughtsTable.id, id))
}

export async function deleteAllThoughts(gameId: number) {
  await db
    .delete(thoughtsTable)
    .where(eq(thoughtsTable.gameId, gameId))
} 