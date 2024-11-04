'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, GamepadIcon, Send, SmileIcon, MehIcon, FrownIcon, Search, Filter, Trash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { getGames, getThoughtsByGameId, addGame, addThought } from '@/app/actions'
import { GameActionsDialog } from "@/components/game-actions-dialog"
import { updateGame, deleteGame } from '@/app/actions'
import { ThoughtActionsDialog } from "@/components/thought-actions-dialog"
import { updateThought, deleteThought } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination } from "@/components/pagination"
import { deleteAllThoughts } from '@/app/actions'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type Game = {
  id: number
  name: string
}

type Mood = 'Happy' | 'Dissatisfied' | 'Neutral'

type Thought = {
  id: number
  content: string
  timestamp: string
  mood: Mood
}

const moodToNumber = (mood: Mood): number => {
  switch (mood) {
    case 'Happy': return 2
    case 'Neutral': return 1
    case 'Dissatisfied': return 0
  }
}

export default function Dashboard() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [newThought, setNewThought] = useState('')
  const [newGameName, setNewGameName] = useState('')
  const [mood, setMood] = useState<Mood>('Neutral')
  const [searchQuery, setSearchQuery] = useState('')
  const [moodFilters, setMoodFilters] = useState<Mood[]>(['Happy', 'Neutral', 'Dissatisfied'])
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [gameSearchQuery, setGameSearchQuery] = useState('')
  const [gamesCurrentPage, setGamesCurrentPage] = useState(1)
  const GAMES_PER_PAGE = 10

  // Load games on component mount
  useEffect(() => {
    const loadGames = async () => {
      const loadedGames = await getGames()
      setGames(loadedGames)
    }
    loadGames()
  }, [])

  const handleAddGame = async () => {
    if (newGameName.trim() === '') return
    const newGame = await addGame(newGameName)
    setGames([...games, newGame])
    setNewGameName('')
  }

  const selectGame = async (game: Game) => {
    setSelectedGame(game)
    const loadedThoughts = await getThoughtsByGameId(game.id)
    setThoughts(loadedThoughts)
  }

  const handleAddThought = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newThought.trim() === '' || !selectedGame) return

    const thought = await addThought(selectedGame.id, newThought, mood)
    
    setThoughts([thought, ...thoughts])
    setNewThought('')
    setMood('Neutral')
  }

  const getMoodIcon = (mood: Mood) => {
    switch (mood) {
      case 'Happy':
        return <SmileIcon className="text-green-500" />
      case 'Dissatisfied':
        return <FrownIcon className="text-red-500" />
      case 'Neutral':
        return <MehIcon className="text-yellow-500" />
    }
  }

  const filteredThoughts = useMemo(() => {
    return thoughts.filter(thought => {
      const matchesSearch = thought.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMood = moodFilters.includes(thought.mood)
      return matchesSearch && matchesMood
    })
  }, [thoughts, searchQuery, moodFilters])

  const paginatedThoughts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredThoughts.slice(startIndex, endIndex)
  }, [filteredThoughts, currentPage])

  const totalPages = useMemo(() => 
    Math.ceil(filteredThoughts.length / ITEMS_PER_PAGE)
  , [filteredThoughts])

  const moodTrendData = useMemo(() => {
    return filteredThoughts
      .slice()
      .reverse()
      .map((thought, index) => ({
        index,
        mood: moodToNumber(thought.mood),
        timestamp: new Date(thought.timestamp).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((data, index) => ({ ...data, index }))
  }, [filteredThoughts])

  const handleEditGame = async (id: number, newName: string) => {
    const updatedGame = await updateGame(id, newName)
    setGames(games.map(game => 
      game.id === id ? updatedGame : game
    ))
  }

  const handleDeleteGame = async (id: number) => {
    await deleteGame(id)
    setGames(games.filter(game => game.id !== id))
    if (selectedGame?.id === id) {
      setSelectedGame(null)
      setThoughts([])
    }
  }

  const handleEditThought = async (id: number, content: string, mood: Mood) => {
    const updatedThought = await updateThought(id, content, mood)
    setThoughts(thoughts.map(thought => 
      thought.id === id ? updatedThought : thought
    ))
  }

  const handleDeleteThought = async (id: number) => {
    await deleteThought(id)
    setThoughts(thoughts.filter(thought => thought.id !== id))
  }

  const handleDeleteAllThoughts = async () => {
    if (!selectedGame) return
    await deleteAllThoughts(selectedGame.id)
    setThoughts([])
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, moodFilters])

  const filteredGames = useMemo(() => {
    return games.filter(game => 
      game.name.toLowerCase().includes(gameSearchQuery.toLowerCase())
    )
  }, [games, gameSearchQuery])

  const paginatedGames = useMemo(() => {
    const startIndex = (gamesCurrentPage - 1) * GAMES_PER_PAGE
    const endIndex = startIndex + GAMES_PER_PAGE
    return filteredGames.slice(startIndex, endIndex)
  }, [filteredGames, gamesCurrentPage])

  const gamesTotalPages = useMemo(() => 
    Math.ceil(filteredGames.length / GAMES_PER_PAGE)
  , [filteredGames])

  useEffect(() => {
    setGamesCurrentPage(1)
  }, [gameSearchQuery])

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-700 to-indigo-800 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-black bg-opacity-50 p-4 overflow-y-auto flex flex-col">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <GamepadIcon className="mr-2" /> Games
        </h2>
        
        {/* Game Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={gameSearchQuery}
            onChange={(e) => setGameSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="pl-10 bg-white bg-opacity-10 border-none text-white placeholder-gray-400"
          />
        </div>

        {/* Add Game Form */}
        <div className="mb-4">
          <Input
            type="text"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            placeholder="Add new game"
            className="bg-white bg-opacity-10 border-none text-white placeholder-gray-400 mb-2"
          />
          <Button onClick={handleAddGame} className="w-full bg-purple-600 hover:bg-purple-700 mb-2">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Game
          </Button>
        </div>

        {/* Games List */}
        <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
          {paginatedGames.map((game) => (
            <div key={game.id} className="flex items-center gap-2">
              <Button
                onClick={() => selectGame(game)}
                className={`flex-1 justify-start ${
                  selectedGame?.id === game.id ? 'bg-purple-600' : 'bg-transparent hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {game.name}
              </Button>
              <GameActionsDialog
                game={game}
                onEdit={handleEditGame}
                onDelete={handleDeleteGame}
              />
            </div>
          ))}

          {games.length > 0 && filteredGames.length === 0 && (
            <p className="text-gray-400 text-center py-4">No games match your search</p>
          )}
        </div>

        {/* Games Pagination */}
        {filteredGames.length > GAMES_PER_PAGE && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <Pagination
              currentPage={gamesCurrentPage}
              totalPages={gamesTotalPages}
              onPageChange={setGamesCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedGame ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold">{selectedGame.name}</h1>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete All Thoughts
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete All Thoughts</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete all thoughts for {selectedGame.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllThoughts}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <form onSubmit={handleAddThought} className="mb-8">
              <Textarea
                value={newThought}
                onChange={(e) => setNewThought(e.target.value)}
                placeholder="Write your thoughts about the game..."
                className="bg-white bg-opacity-10 border-none text-white placeholder-gray-400 mb-4 min-h-[100px]"
              />
              <div className="flex items-center space-x-4">
                <Select value={mood} onValueChange={(value: Mood) => setMood(value)}>
                  <SelectTrigger className="w-[180px] bg-white bg-opacity-10 border-none text-white">
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Happy">Happy</SelectItem>
                    <SelectItem value="Dissatisfied">Dissatisfied</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-green-500 hover:bg-green-600">
                  <Send className="mr-2 h-4 w-4" /> Add Thought
                </Button>
              </div>
            </form>

            {/* Mood Trend Chart */}
            {thoughts.length > 1 && (
              <Card className="mb-8 bg-white bg-opacity-10">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold">Mood Trend</h2>
                  </div>
                  <div className="p-4">
                    <ChartContainer
                      config={{
                        mood: {
                          label: "Mood",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[200px] w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={moodTrendData}>
                          <XAxis
                            dataKey="timestamp"
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                            stroke="hsl(var(--chart-1))"
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tickFormatter={(value) => {
                              const moods = ['Dissatisfied', 'Neutral', 'Happy']
                              return moods[Math.round(value)] || ''
                            }}
                            domain={[0, 2]}
                            ticks={[0, 1, 2]}
                            stroke="hsl(var(--chart-1))"
                          />
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const moods = ['Dissatisfied', 'Neutral', 'Happy'];
                                return (
                                  <div className="bg-white bg-opacity-80 p-2 rounded shadow">
                                    <p className="text-black">{new Date(data.timestamp).toLocaleString()}</p>
                                    <p className="text-black font-bold">{moods[data.mood]}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="mood"
                            stroke="var(--color-mood)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Filter */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thoughts..."
                  className="pl-10 bg-white bg-opacity-10 border-none text-white placeholder-gray-400"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white bg-opacity-10 border-none text-white">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter Moods
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(['Happy', 'Neutral', 'Dissatisfied'] as const).map((mood) => (
                    <DropdownMenuCheckboxItem
                      key={mood}
                      checked={moodFilters.includes(mood)}
                      onCheckedChange={(checked) => {
                        setMoodFilters(prev => 
                          checked 
                            ? [...prev, mood]
                            : prev.filter(m => m !== mood)
                        )
                      }}
                    >
                      <div className="flex items-center">
                        {getMoodIcon(mood)}
                        <span className="ml-2">{mood}</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <AnimatePresence>
              {paginatedThoughts.map((thought) => (
                <motion.div
                  key={thought.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="mb-4 bg-white bg-opacity-10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-400">{thought.timestamp}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {getMoodIcon(thought.mood)}
                            <span className="ml-2 text-sm">{thought.mood}</span>
                          </div>
                          <ThoughtActionsDialog
                            thought={thought}
                            onEdit={handleEditThought}
                            onDelete={handleDeleteThought}
                          />
                        </div>
                      </div>
                      <p>{thought.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredThoughts.length > ITEMS_PER_PAGE && (
              <div className="mt-6 mb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}

            {thoughts.length > 0 && filteredThoughts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No thoughts match your search criteria</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-2xl text-gray-400">Select a game to start reviewing</p>
          </div>
        )}
      </div>
    </div>
  )
}