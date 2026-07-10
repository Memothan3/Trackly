import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { tracklyConfig } from "@/lib/config"

const app = initializeApp(tracklyConfig.firebase)
export const firebaseAuth = getAuth(app)
