import Image from "next/image";

const leaders = [
  {
    name: "Marcus Webb",
    role: "CEO & Co-Founder",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
  },
  {
    name: "Priya Sharma",
    role: "CTO & Co-Founder",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
  },
  {
    name: "James O'Connor",
    role: "VP Operations",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80",
  },
  {
    name: "Sofia Reyes",
    role: "Head of Partnerships",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80",
  },
];

export default function LeadershipTeam() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900">
            Leadership Team
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {leaders.map((leader) => (
            <div
              key={leader.name}
              className="flex flex-col items-center text-center"
            >
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-slate-200 mb-5">
                <Image
                  src={leader.image}
                  alt={leader.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                {leader.name}
              </h3>

              <p className="mt-1 text-slate-500">
                {leader.role}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}