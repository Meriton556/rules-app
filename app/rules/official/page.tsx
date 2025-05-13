"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookCheck, FolderTree, Package, Zap } from "lucide-react";
import { Rule, fetchRules } from "@/app/api/rulesApi";
import React from "react";
import { OfficialBadge } from "@/components/official-badge";

interface OfficialRule {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  category: string;
  tags: string[];
  authorName: string;
  badge: string;
  isOfficial: boolean;
}

// Official rules with their fixed data
const predefinedRules: OfficialRule[] = [
  {
    id: "official-1",
    title: "Backend Directory Structure",
    description: "Standard structure for FastAPI backends with proper separation of concerns and modular design",
    content: "- Use `/routers` for API endpoints\n- Use `/models` for database models\n- Use `/schemas` for Pydantic models\n- Keep business logic in `/services`\n- Database connection in `database.py`\n- Entry point in `main.py`",
    icon: <FolderTree className="h-10 w-10 text-blue-400" />,
    category: "Backend",
    tags: [],
    authorName: "",
    badge: "Official",
    isOfficial: true
  },
  {
    id: "official-2",
    title: "Use PNPM Instead of NPM",
    description: "Benefits of using PNPM over NPM for JavaScript/TypeScript projects",
    content: "- Faster installation\n- Disk space efficient\n- Strict dependency resolution\n- Prevents phantom dependencies\n- Better monorepo support with workspaces",
    icon: <Package className="h-10 w-10 text-green-400" />,
    category: "Frontend",
    tags: [],
    authorName: "",
    badge: "Official",
    isOfficial: true
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
    badge: "Official",
    isOfficial: true
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
    badge: "Official",
    isOfficial: true
  }
];

// Icons mapping for custom official rules
const categoryIcons: Record<string, React.ReactNode> = {
  "Backend": <FolderTree className="h-10 w-10 text-blue-400" />,
  "Frontend": <Package className="h-10 w-10 text-green-400" />,
  "React": <Zap className="h-10 w-10 text-purple-400" />,
  "API": <BookCheck className="h-10 w-10 text-yellow-400" />,
};

export default function OfficialRulesPage() {
  const [customRules, setCustomRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const data = await fetchRules();
        // Filter to only get official rules
        const officialRules = data.filter(rule => rule.isOfficial === true);
        console.log("Fetched official rules:", officialRules);
        setCustomRules(officialRules);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch rules:", err);
        setError("Failed to load official rules");
        setCustomRules([]);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  // Get default icon based on category
  const getIconForCategory = (category: string) => {
    return categoryIcons[category] || <BookCheck className="h-10 w-10 text-yellow-400" />;
  };

  // Combine predefined and custom rules
  const allRules: Array<OfficialRule | (Rule & { icon: React.ReactNode; badge: string })> = [...predefinedRules];
  
  // Only add custom rules if we have them and they're loaded
  if (!loading && customRules.length > 0) {
    // Add custom rules with icon based on category
    customRules.forEach(rule => {
      allRules.push({
        ...rule,
        icon: getIconForCategory(rule.category),
        badge: "Official"
      });
    });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-white">Official Rules</h1>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">Loading official rules...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {allRules.map((rule, index) => (
            <Card key={rule.id?.toString() || `custom-${index}`} className="h-[500px] bg-gradient-to-br from-zinc-900 to-zinc-950 border-[0.5px] border-zinc-700/30 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {rule.icon}
                  <OfficialBadge />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{rule.title}</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-3 h-[60px]">{rule.description}</p>
                <div className="bg-zinc-800/50 p-4 rounded-md border-[0.5px] border-zinc-700/30 mb-4 h-[240px] overflow-y-auto">
                  <pre className="text-xs text-zinc-300 whitespace-pre-wrap">{rule.content}</pre>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-[0.5px] border-zinc-700/30">
                <span className="text-xs text-zinc-500">{rule.category}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 