import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { fetchRules, Rule } from "@/app/api/rulesApi"
import { BookCheck, FolderTree, Package, Zap } from "lucide-react"
import { OfficialBadge } from "./official-badge"

// Hardcoded official rules
const officialRules = [
  {
    id: "official-1",
    title: "Backend Directory Structure",
    description: "Standard structure for FastAPI backends with proper separation of concerns and modular design",
    content: "- Use `/routers` for API endpoints\n- Use `/models` for database models\n- Use `/schemas` for Pydantic models\n- Keep business logic in `/services`\n- Database connection in `database.py`\n- Entry point in `main.py`",
    icon: <FolderTree className="h-10 w-10 text-blue-400" />,
    category: "Backend",
    tags: [],
    authorName: "",
    badge: "Official"
  },
  {
    id: "official-2",
    title: "Use PNPM Instead of NPM",
    description: "Benefits of using PNPM over NPM for JavaScript/TypeScript projects",
    content: "- Faster installation\n- Disk space efficient\n- Strict dependency resolution\n- Prevents phantom dependencies\n- Better monorepo support with workspaces",
    icon: <Package className="h-10 w-10 text-blue-400" />,
    category: "Frontend",
    tags: [],
    authorName: "",
    badge: "Official"
  },
  {
    id: "official-3",
    title: "React Component Best Practices",
    description: "Guidelines for writing clean, maintainable React components",
    content: "- Use functional components with hooks\n- Extract complex logic to custom hooks\n- Follow SRP (Single Responsibility Principle)\n- Use React.memo for performance optimization\n- Proper prop types/TypeScript interfaces\n- Consistent naming conventions",
    icon: <Zap className="h-10 w-10 text-purple-400" />,
    category: "React",
    tags: [],
    authorName: "",
    badge: "Official"
  },
  {
    id: "official-4",
    title: "API Error Handling Standards",
    description: "Consistent error handling patterns for RESTful APIs",
    content: "- Use appropriate HTTP status codes\n- Include error message, code, and details\n- Standardize error response format\n- Log errors with correlation IDs\n- Return validation errors in a consistent format\n- Handle unexpected errors gracefully",
    icon: <BookCheck className="h-10 w-10 text-yellow-400" />,
    category: "API",
    tags: [],
    authorName: "",
    badge: "Official"
  }
];

export default function FeaturedRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const data = await fetchRules();
        setRules(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch rules:", err);
        setError("Failed to load rules from the backend.");
        setRules([]);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  if (loading) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Rules</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800 animate-pulse h-80">
              <CardContent className="p-6">
                <div className="h-6 bg-zinc-800 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-zinc-800 rounded mb-2 w-full"></div>
                <div className="h-4 bg-zinc-800 rounded mb-2 w-full"></div>
                <div className="h-4 bg-zinc-800 rounded mb-4 w-1/2"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-zinc-800 rounded w-16"></div>
                  <div className="h-6 bg-zinc-800 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Rules</h2>
        <Link 
          href="/category/general" 
          className="text-white relative group overflow-hidden px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-yellow-500/10 hover:from-blue-500/20 hover:to-yellow-500/20 transition-all duration-300"
        >
          <span className="relative z-10 font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400 group-hover:from-blue-300 group-hover:to-yellow-300">
            View All General Rules 
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/50 to-yellow-500/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
        </Link>
      </div>

      {error && <div className="text-red-400 mb-4 text-sm">{error}</div>}

      {/* Official Rules Section */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {officialRules.map((rule) => (
            <Link href="/category/general" key={rule.id}>
              <Card 
                className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all overflow-hidden group"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    {rule.icon}
                  </div>
                  <div className="space-y-3 mb-4 flex-grow">
                    <h3 className="font-semibold text-white">{rule.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-4 group-hover:text-zinc-300 transition-colors">{rule.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-zinc-800">
                  <span className="text-xs text-zinc-500">{rule.category}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
