import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, LockKeyhole } from "lucide-react"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { loginUser } from "../services/api"
import { useAuth } from "../context/AuthContext"


function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({
        email: "",
        password: "",
    })

    const [error, setError] = useState("")

    const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
        ...current,
        [name]: value,
    }))
}

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")

    if (!form.email || !form.password) {
        setError("Please enter your email and password.")
        return
    }

    try {
        const data = await loginUser(form.email, form.password)

        console.log("Login response:", data)

    // Temporary — we'll adjust this after seeing the actual response
        login(data.access_token, data.user)

        const role = data.user?.role?.toUpperCase()

        if (role === "ADMIN") {
            navigate("/admin")
        } else {
          navigate("/")
        }
      } catch (error) {
        setError(error.message)
      }
    }

  return (
    <main className="flex min-h-screen bg-[#f8fafc]">

      {/* Brand panel */}
      <section className="hidden w-1/2 bg-slate-950 p-10 lg:flex lg:flex-col lg:justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white">
            H
          </div>

          <div>
            <p className="font-semibold tracking-tight text-white">
              HostelOps
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Operations
            </p>
          </div>
        </div>

        <div className="max-w-lg">

          <p className="text-sm font-medium text-indigo-400">
            Hostel maintenance, simplified.
          </p>

          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
            One workspace for every hostel operation.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
            Manage complaints, maintenance workflows, technicians and
            operational insights from one intelligent platform.
          </p>

        </div>

        <p className="text-xs text-slate-600">
          HostelOps · Operations Platform
        </p>

      </section>

      {/* Login */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">

        <div className="w-full max-w-md">

          {/* Mobile brand */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
              H
            </div>

            <div>
              <p className="font-semibold tracking-tight text-slate-950">
                HostelOps
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Operations
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-indigo-600">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Sign in to HostelOps
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

            {error && (
              <p
                className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
            >
              Sign in
              <ArrowRight size={17} />
            </Button>

          </form>

          <div className="mt-8 flex items-center gap-3 text-xs text-slate-400">
            <LockKeyhole size={14} />
            <span>Your account is protected by secure authentication.</span>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              Create one
            </Link>
          </p>

        </div>

      </section>

    </main>
  )
}

export default Login