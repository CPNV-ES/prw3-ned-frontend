import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Home" />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to the Home Page</h2>
      </main>
    </div>
  );
}
