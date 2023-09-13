import { initializeApp } from "firebase/app"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID
}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)

const loginAndGetToken = async () => {
  const usercred = await signInWithEmailAndPassword(auth, process.env.EMAIL!, process.env.PASSWORD!)
  return await auth.currentUser?.getIdToken()
}

export default loginAndGetToken