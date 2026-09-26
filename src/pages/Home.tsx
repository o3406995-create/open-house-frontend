import { useAppSelector } from "@/store/hooks"

export default function Home() {
  const user = useAppSelector((state) => state.auth.user)
  const title = user ? `Welcome back, ${user.name}` : "Welcome back"
  return <div>
    <h1>{title}</h1>
  </div>
}
