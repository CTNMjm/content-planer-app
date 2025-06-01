// src/app/login/page.tsx
export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Login zum ContentPlaner</h1>
      <form className="flex flex-col gap-4 w-80 p-6 border rounded shadow">
        <label>
          <span className="block mb-1">E-Mail</span>
          <input type="email" name="email" required className="w-full border p-2 rounded" />
        </label>
        <label>
          <span className="block mb-1">Passwort</span>
          <input type="password" name="password" required className="w-full border p-2 rounded" />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </main>
  )
}