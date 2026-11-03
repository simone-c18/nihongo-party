
import { get, ref } from "firebase/database";
import { database } from "./firebase.js";
import { getCurrentPlayer } from "./roomcode.js";

export async function getQuestions() {
  await getCurrentPlayer();

  const snapshot = await get(ref(database, "questions"));

  if (!snapshot.exists()) {
    throw new Error("No questions found in Firebase.");
  }

  return Object.entries(snapshot.val()).map(([id, data]) => ({
    id,
    ...data
  }));
}
