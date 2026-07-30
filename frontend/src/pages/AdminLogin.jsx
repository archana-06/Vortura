import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminLogin() {

  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {

    if (
      username === "admin" &&
      password === "admin123"
    ) {

      navigate("/admin-dashboard")

    } else {

      alert("Invalid Credentials")

    }

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#071224] via-[#0b1830] to-[#061122] flex items-center justify-center px-6">

      {/* Glow Effect */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-3xl rounded-full"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-xl bg-[#0b1d35]/90 backdrop-blur-xl border border-cyan-500/10 rounded-3xl p-14 shadow-2xl">

        {/* Logo */}
        <div className="flex justify-center mb-6">

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">

            <span className="text-3xl font-bold text-white">
              V
            </span>

          </div>

        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-center text-white mb-3">
          Admin Portal
        </h1>

        <p className="text-center text-slate-400 mb-8">
          Secure blockchain election administration access
        </p>

        {/* Username */}
        <div className="mb-5">

          <label className="block text-sm text-slate-300 mb-2">
            Username
          </label>

          <input
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#08172d] border border-cyan-500/10 focus:border-cyan-400 outline-none px-4 py-4 rounded-2xl text-white placeholder:text-slate-500"
          />

        </div>

        {/* Password */}
        <div className="mb-8">

          <label className="block text-sm text-slate-300 mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#08172d] border border-cyan-500/10 focus:border-cyan-400 outline-none px-4 py-4 rounded-2xl text-white placeholder:text-slate-500"
          />

        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] transition-all duration-300 text-white py-4 rounded-2xl font-semibold shadow-lg"
        >
          Access Dashboard
        </button>

        {/* Bottom Text */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Protected by AI security & blockchain verification
        </p>

      </div>

    </div>

  )

}

export default AdminLogin