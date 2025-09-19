import Image from "next/image";
import Link from "next/link";

export default function HarvestPage() {
  return (
    <main className="h-screen flex flex-col justify-end overflow-hidden bg-[var(--background)] text-[var(--foreground)] relative">
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">
        아무것도 심기지 않았습니다. 심을 씨앗을 골라주세요!
      </div>
      <div className="absolute top-4 right-4">
        <Link href="/harvest/empty-harvest/box">
          <Image
            src="/box.png"
            alt="box"
            width={300}
            height={300}
          />
        </Link>
      </div>
      <div className="w-full flex justify-center">
        <Image
          src="/Ellipse 2.png"
          alt="ellipse decoration"
          width={800}
          height={200}
          style={{ objectFit: "cover", width: "90vw", height: "auto" }}
        />
      </div>
    </main>
  );
}