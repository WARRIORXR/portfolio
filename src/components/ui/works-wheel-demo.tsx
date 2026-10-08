"use client";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";

// Tanish Jaswal's projects — real Unsplash images matched to each project's
// domain. The wheel sizes its ring to however many pieces it is handed.
const WORKS: WorksWheelItem[] = [
  {
    title: "Movie Recommender",
    image:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    href: "https://github.com/WARRIORXR",
  },
  {
    title: "ML Practice Portfolio",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    href: "https://github.com/WARRIORXR",
  },
  {
    title: "Neural Networks",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    href: "https://github.com/WARRIORXR",
  },
  {
    title: "Data Science",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    href: "https://github.com/WARRIORXR",
  },
  {
    title: "Flask API",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    href: "https://github.com/WARRIORXR",
  },
  {
    title: "Portfolio",
    image:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    href: "https://github.com/WARRIORXR",
  },
  {
    title: "Cloud Infra",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    href: "https://github.com/WARRIORXR",
  },
];

export default function WorksWheelDemo() {
  return (
    <div className="bg-background text-foreground w-full h-screen">
      <WorksWheel items={WORKS} label="Projects '26" action="View" />
    </div>
  );
}
