import db from "./index";
import { gamesTable, thoughtsTable } from "./schema";

const seed = async () => {
  await db.insert(gamesTable).values([{ name: "Assasin's Creed 3" }]);
  await db.insert(thoughtsTable).values([
    { gameId: 1, content: "I love this game!", mood: "Happy" },
    { gameId: 1, content: "I hate this game!", mood: "Sad" },
  ]);

  console.log("Seed completed");
};

seed();
