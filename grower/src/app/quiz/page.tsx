export default function QuizPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex flex-col items-center space-y-6">
        <button className="w-32 text-xl rounded-md bg-[#4cbd06] text-white py-3 font-semibold transition-colors hover:bg-green-600">
          쉬움
        </button>
        <button className="w-32 text-xl rounded-md bg-[#4cbd06] text-white py-3 font-semibold transition-colors hover:bg-green-600">
          보통
        </button>
        <button className="w-32 text-xl rounded-md bg-[#4cbd06] text-white py-3 font-semibold transition-colors hover:bg-green-600">
          어려움
        </button>
      </div>
    </main>
  );
}
