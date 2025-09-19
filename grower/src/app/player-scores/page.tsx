// (필요시) "use client";

export const metadata = {
  title: "플레이어 점수",
};

export default function PlayerScoresPage() {
  const players = [
    { name: "Alice", score: 1250 },
    { name: "Bob", score: 980 },
    { name: "Charlie", score: 1430 },
    { name: "Diana", score: 1175 },
    { name: "Ethan", score: 890 },
  ];

  return (
    <main style={{ padding: "2rem" }}>
      <h1>플레이어 점수</h1>
      <table style={{ marginTop: "1rem", borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "2px solid #ccc", textAlign: "left", padding: "0.5rem" }}>이름</th>
            <th style={{ borderBottom: "2px solid #ccc", textAlign: "right", padding: "0.5rem" }}>점수</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.name}>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{p.name}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem", textAlign: "right" }}>
                {p.score.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}