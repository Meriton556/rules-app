import { Code, Globe, Layout, Server, Shield, Zap, Database, Cloud, Box, TestTube, FileCode, Layers, BarChart, GitBranch } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchCategories, Category } from "@/app/api/rulesApi"
import React from "react"

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Icon mapping
  const iconMap: Record<string, React.ReactNode> = {
    "TypeScript": <Code className="w-5 h-5" />,
    "React": <Zap className="w-5 h-5" />,
    "Node.js": <Server className="w-5 h-5" />,
    "Frontend": <Layout className="w-5 h-5" />,
    "Security": <Shield className="w-5 h-5" />,
    "Web": <Globe className="w-5 h-5" />,
    "Python": <Code className="w-5 h-5" />,
    "Git": <GitBranch className="w-5 h-5" />,
    "React Router": <Layout className="w-5 h-5" />,
    "Redux": <Box className="w-5 h-5" />,
    "Zustand": <Box className="w-5 h-5" />,
    "React Query": <Database className="w-5 h-5" />,
    "SQL": <Database className="w-5 h-5" />,
    "NoSQL": <Database className="w-5 h-5" />,
    "Graph": <BarChart className="w-5 h-5" />,
    "CI/CD": <GitBranch className="w-5 h-5" />,
    "Containerization": <Box className="w-5 h-5" />,
    "AWS": <Cloud className="w-5 h-5" />,
    "Azure": <Cloud className="w-5 h-5" />,
    "Google Cloud": <Cloud className="w-5 h-5" />,
    "Unit Testing": <TestTube className="w-5 h-5" />,
    "Flask": <FileCode className="w-5 h-5" />,
    "FastAPI": <FileCode className="w-5 h-5" />,
    "SASS/SCSS": <Layers className="w-5 h-5" />
  };
  
  // Color mapping
  const colorMap: Record<string, string> = {
    "TypeScript": "bg-blue-500/20 text-blue-400",
    "React": "bg-cyan-500/20 text-cyan-400",
    "Node.js": "bg-green-500/20 text-green-400", 
    "Frontend": "bg-yellow-500/20 text-yellow-400",
    "Security": "bg-red-500/20 text-red-400",
    "Web": "bg-purple-500/20 text-purple-400",
    "Python": "bg-green-500/20 text-green-400",
    "Git": "bg-orange-500/20 text-orange-400",
    "React Router": "bg-cyan-500/20 text-cyan-400",
    "Redux": "bg-purple-500/20 text-purple-400",
    "Zustand": "bg-yellow-500/20 text-yellow-400",
    "React Query": "bg-red-500/20 text-red-400",
    "SQL": "bg-blue-500/20 text-blue-400",
    "NoSQL": "bg-green-500/20 text-green-400",
    "Graph": "bg-indigo-500/20 text-indigo-400",
    "CI/CD": "bg-orange-500/20 text-orange-400",
    "AWS": "bg-orange-500/20 text-orange-400",
    "Azure": "bg-blue-500/20 text-blue-400",
    "Google Cloud": "bg-red-500/20 text-red-400",
    "Unit Testing": "bg-green-500/20 text-green-400",
    "Flask": "bg-gray-500/20 text-gray-400",
    "FastAPI": "bg-teal-500/20 text-teal-400",
    "SASS/SCSS": "bg-pink-500/20 text-pink-400"
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Failed to load categories from the backend.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center p-4 rounded-lg border border-zinc-800 h-24 animate-pulse bg-zinc-900/50">
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Categories</h2>
        <Link 
          href="/category/all" 
          className="text-white relative group overflow-hidden px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-yellow-500/10 hover:from-emerald-500/20 hover:to-yellow-500/20 transition-all duration-300"
        >
          <span className="relative z-10 font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400 group-hover:from-emerald-300 group-hover:to-yellow-300">
            View All
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/50 to-yellow-500/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
        </Link>
      </div>

      {error && <div className="text-red-400 mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const iconKey = category.name as string;
          const icon = iconMap[iconKey] || <Code className="w-5 h-5" />;
          const color = colorMap[iconKey] || "bg-gray-500/20 text-gray-400";
          
          return (
            <Link
              key={category.name}
              href={`/category/${category.name.toLowerCase()}`}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition bg-zinc-900/50 hover:bg-zinc-800/50"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${color}`}>
                {icon}
              </div>
              <span className="font-medium">{category.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
