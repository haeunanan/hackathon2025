import Image from "next/image";
import ellipse from "../../../public/Ellipse 2.png";
import sprout from "../../../public/1 1.png";

export default function QuizPage() {
  return (
    <main className="flex items-center justify-center h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="absolute top-24 left-4 text-xl font-semibold">
        다음 단계까지 : nn점
      </div>
      <div className="absolute bottom-0 left-0 w-full flex justify-center flex-col items-center">
        <Image src={sprout} alt="sprout" className="mb-0" />
        <Image src={ellipse} alt="ellipse decoration" />
      </div>
    </main>
  );
}
