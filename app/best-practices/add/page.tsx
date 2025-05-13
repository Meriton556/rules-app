"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import UserMenu from '@/components/auth/UserMenu';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';

const TOOLS = [
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-powered code editor",
    color: "emerald"
  },
  {
    id: "cline",
    name: "Cline",
    description: "Command-line interface",
    color: "blue"
  },
  {
    id: "roocode",
    name: "Roocode",
    description: "Code organization tool",
    color: "purple"
  },
  {
    id: "v0dev",
    name: "v0.dev",
    description: "UI prototyping tool",
    color: "pink"
  }
];

const ALLOWED_COMBINATIONS = [
  {
    primary: "cursor",
    secondary: "v0dev",
    id: "cursor-v0dev"
  }
];

export default function AddBestPracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTool = searchParams.get('tool');

  const [isCombined, setIsCombined] = useState(initialTool === 'cursor-v0dev');
  const [primaryTool, setPrimaryTool] = useState<string>(
    isCombined ? "cursor" : (initialTool || "")
  );
  const [secondaryTool, setSecondaryTool] = useState<string>(
    isCombined ? "v0dev" : ""
  );
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("meritonkastrati5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const toolId = isCombined ? `${primaryTool}-${secondaryTool}` : primaryTool;
      
      console.log('Attempting to insert:', {
        tool_id: toolId,
        content,
        author_name: authorName
      });

      const { data, error } = await supabase
        .from('best_practices')
        .insert({
          tool_id: toolId,
          content,
          author_name: authorName
        })
        .select();

      if (error) {
        console.error('Full Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Supabase error: ${error.message} (${error.code})`);
      }

      console.log('Successfully created best practice:', data);
      router.push(`/best-practices/${toolId}`);
    } catch (error: any) {
      console.error('Detailed error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidCombination = () => {
    return ALLOWED_COMBINATIONS.some(
      combo => combo.primary === primaryTool && combo.secondary === secondaryTool
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950/30">
      {/* Top Header - Fixed */}
      <div className="bg-transparent py-3 px-6 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
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

      {/* Main Content - Centered Card */}
      <div className="flex-1 container mx-auto py-8 px-6 flex items-center justify-center">
        <Card className="bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700/50 p-8 w-[800px] space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/best-practices"
                className="text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-emerald-600">Add Best Practice</h1>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isCombined}
                onCheckedChange={setIsCombined}
                className="data-[state=checked]:bg-zinc-800"
              />
              <Label className="text-zinc-400 text-sm">Combine Tools</Label>
            </div>
          </div>

          <div className="space-y-6">
            {/* Tool Selection */}
            <div className={`grid ${isCombined ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
              {/* Primary Tool */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-600">
                  {isCombined ? 'Primary Tool' : 'Tool'}
                </label>
                <Select
                  value={primaryTool}
                  onValueChange={(value) => {
                    setPrimaryTool(value);
                    if (isCombined && secondaryTool && !isValidCombination()) {
                      setSecondaryTool("");
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-zinc-900/50 border-zinc-700/50 text-white hover:border-zinc-600/50 transition-colors">
                    <SelectValue placeholder={`Select ${isCombined ? 'primary ' : ''}tool`} />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {TOOLS.map((tool) => (
                      <SelectItem
                        key={tool.id}
                        value={tool.id}
                        className="text-white hover:bg-zinc-700/80"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md bg-${tool.color}-950/50 border border-${tool.color}-800/30 flex items-center justify-center`}>
                            <span className={`text-${tool.color}-500 text-sm font-bold`}>
                              {tool.name[0]}
                            </span>
                          </div>
                          <span className={`text-${tool.color}-500 font-medium`}>
                            {tool.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Secondary Tool */}
              {isCombined && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-emerald-600">
                    Secondary Tool
                  </label>
                  <Select
                    value={secondaryTool}
                    onValueChange={setSecondaryTool}
                  >
                    <SelectTrigger 
                      className="w-full bg-zinc-900/50 border-zinc-700/50 text-white hover:border-zinc-600/50 transition-colors"
                      disabled={!primaryTool}
                    >
                      <SelectValue placeholder="Select secondary tool" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {TOOLS
                        .filter(tool => {
                          return ALLOWED_COMBINATIONS.some(
                            combo => combo.primary === primaryTool && combo.secondary === tool.id
                          );
                        })
                        .map((tool) => (
                          <SelectItem
                            key={tool.id}
                            value={tool.id}
                            className="text-white hover:bg-zinc-700/80"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-md bg-${tool.color}-950/50 border border-${tool.color}-800/30 flex items-center justify-center`}>
                                <span className={`text-${tool.color}-500 text-sm font-bold`}>
                                  {tool.name[0]}
                                </span>
                              </div>
                              <span className={`text-${tool.color}-500 font-medium`}>
                                {tool.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Author Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Author
              </label>
              <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-md px-3 py-2 text-base text-zinc-400">
                {authorName}
              </div>
            </div>

            {/* Content Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Best Practice Content
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isCombined 
                  ? "Describe how to use these tools together effectively..."
                  : "Enter your best practice here..."
                }
                className="w-full h-[200px] bg-zinc-900/50 border-zinc-700/50 text-white text-base resize-none hover:border-zinc-600/50 focus:border-zinc-600/50 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!primaryTool || (isCombined && !secondaryTool) || !content.trim() || isSubmitting}
                className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-6 py-2 rounded-lg transition-all duration-200 disabled:bg-zinc-800/50 disabled:border-zinc-700/50 disabled:text-zinc-500"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 