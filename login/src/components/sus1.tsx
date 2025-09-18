import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

const incrementUserCount1 = async () => {
  const counterRef = doc(db, "counters", "userCount");

  try {
    const counterSnap = await getDoc(counterRef);

    if (!counterSnap.exists()) {
      // Initialize the counter if it doesn't exist
      await setDoc(counterRef, { count: 0 });
      console.log("Counter document initialized.");
    }

    // Now safely increment the count
    await updateDoc(counterRef, {
      count: increment(1)
    });

    console.log("User count incremented.");
  } catch (error) {
    console.error("Failed to increment user count:", error);
  }
};

export default incrementUserCount1;
