"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Edit2, Save, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import UserMenu from '@/components/auth/UserMenu';
import { supabase } from '@/lib/supabase';

const TOOL_COLORS = {
  cursor: "emerald",
  cline: "blue",
  roocode: "purple",
  v0dev: "pink",
  "cursor-v0dev": "emerald"
} as const;

const TOOL_DESCRIPTIONS = {
  cursor: "AI-powered code editor",
  cline: "Command-line interface",
  roocode: "Code organization tool",
  v0dev: "UI prototyping tool",
  "cursor-v0dev": "AI-powered UI development workflow"
};

interface BestPractice {
  id: number;
  tool_id: string;
  content: string;
  author_name: string;
  created_at: string;
  tags: string[];
}

export default function ToolBestPracticesPage() {
  const params = useParams();
  const tool = params.tool as string;
  const toolColor = TOOL_COLORS[tool as keyof typeof TOOL_COLORS] || "emerald";
  const toolDescription = TOOL_DESCRIPTIONS[tool as keyof typeof TOOL_DESCRIPTIONS] || "";
  
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPractices();
  }, [tool]);

  const fetchPractices = async () => {
    if (!tool) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('best_practices')
        .select('*')
        .eq('tool_id', tool)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPractices(data || []);
    } catch (error) {
      console.error('Error fetching practices:', error);
      setError('Failed to load best practices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const savePractice = async (id: number) => {
    if (!editContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from('best_practices')
        .update({ content: editContent.trim() })
        .eq('id', id);

      if (error) throw error;
      
      setPractices(practices.map(p => 
        p.id === id ? { ...p, content: editContent.trim() } : p
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating practice:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950/30">
      {/* Top Header - Fixed */}
      <div className="bg-transparent py-3 px-6 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <Link href="/" className="text-lg font-medium text-white">
              XponentL
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/category/all" 
              className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Rules
            </Link>
            <Link 
              href="/best-practices" 
              className="text-white transition-colors duration-200 text-sm font-medium"
            >
              Best Practices
            </Link>
            <Link 
              href="/generate" 
              className="text-zinc-400 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Generate
            </Link>
          </div>
          <div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/best-practices"
              className={`text-${toolColor}-600 hover:text-${toolColor}-500 transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${toolColor}-500/20 flex items-center justify-center`}>
                  <span className={`text-${toolColor}-500 text-xl font-bold`}>
                    {tool[0].toUpperCase()}
                  </span>
                </div>
                <h1 className={`text-2xl font-bold text-${toolColor}-500 capitalize`}>
                  {tool}
                </h1>
              </div>
              <p className="text-zinc-400 mt-1">{toolDescription}</p>
            </div>
          </div>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href={`/best-practices/add?tool=${tool}`} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Link>
          </Button>
        </div>

        {/* Best Practices List */}
        <div className="space-y-6 max-w-[900px] mx-auto">
          {error ? (
            <div className="text-center text-red-400 bg-red-900/10 border border-red-900/20 rounded-lg p-4">
              {error}
            </div>
          ) : loading ? (
            <div className="text-center text-zinc-400 p-4">Loading practices...</div>
          ) : practices.length === 0 ? (
            <div className="text-center text-zinc-400 bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-8">
              No best practices yet. Be the first to add one!
            </div>
          ) : practices.map((practice) => (
            <Card 
              key={practice.id}
              className="bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700/50 transition-all duration-200"
            >
              {editingId === practice.id ? (
                <div className="p-6 space-y-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[100px] bg-zinc-900/50 border-zinc-700/50 text-white text-lg resize-none hover:border-blue-800/50 focus:border-blue-800/50 transition-colors"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="text-zinc-400 hover:text-white border-zinc-700 hover:border-zinc-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => savePractice(practice.id)}
                      className={`bg-${toolColor}-800 hover:bg-${toolColor}-900 text-white`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <p className="text-white text-xl leading-relaxed font-medium">{practice.content}</p>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingId(practice.id);
                        setEditContent(practice.content);
                      }}
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex gap-2">
                      {practice.tags?.map((tag) => (
                        <span 
                          key={tag} 
                          className={`px-2 py-1 bg-zinc-900 rounded-md text-sm font-medium text-${toolColor}-500`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-zinc-500 text-base">
                      Added by <span className={`text-${toolColor}-500`}>{practice.author_name}</span> on {new Date(practice.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 