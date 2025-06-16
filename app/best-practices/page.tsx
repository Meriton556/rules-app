"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Terminal, Code2, Blocks, Layout, Sparkles } from "lucide-react";
import Link from "next/link";
import UserMenu from '@/components/auth/UserMenu';
import { useState } from "react";

// Custom icons for tools
interface IconProps {
  className?: string;
}

const RoocodeIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M25 20L35 30L45 20L45 40L65 30L75 40L65 50L65 70L45 80L45 60L25 70V20Z" fillRule="evenodd" />
  </svg>
);

const ClineIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M20 20h60v60H20V20zm15 15h30v15H35V35zm0 20h30v15H35V55z" fillRule="evenodd" />
  </svg>
);

const CursorIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M30 30l40 0l0 40l-40 0l0 -40zm5 5l30 15l-30 15l0 -30z" fillRule="evenodd" />
  </svg>
);

const V0DevIcon: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 100 100" fill="currentColor" className={className || "w-6 h-6"}>
    <path d="M15 15L35 50L15 85L85 85L65 50L85 15L15 15Z" fillRule="evenodd" />
  </svg>
);

const TOOLS = [
  {
    id: "cursor",
    name: "Cursor",
    description: "AI-powered code editor",
    color: "blue",
    icon: CursorIcon,
    practiceCount: 5
  },
  {
    id: "cline",
    name: "Cline",
    description: "Command-line interface",
    color: "blue",
    icon: ClineIcon,
    practiceCount: 3
  },
  {
    id: "roocode",
    name: "Roocode",
    description: "Code organization tool",
    color: "purple",
    icon: RoocodeIcon,
    practiceCount: 4
  },
  {
    id: "v0dev",
    name: "v0.dev",
    description: "UI prototyping tool",
    color: "pink",
    icon: V0DevIcon,
    practiceCount: 2
  }
];

const MIXED_TOOLS = [
  {
    id: "cursor-v0dev",
    name: "Cursor + v0.dev",
    description: "AI-powered UI development workflow",
    primaryColor: "blue",
    secondaryColor: "pink",
    practiceCount: 1
  }
];

export default function BestPracticesPage() {
  const [showMixed, setShowMixed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950/30">
      {/* Top Header - Fixed */}
      <div className="bg-transparent py-3 px-6 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
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
      <div className="flex-1 container mx-auto py-8 px-6 flex flex-col items-center">
        <div className="mb-12 text-center space-y-6">
          <h1 className="text-3xl font-bold text-blue-600">Best Practices</h1>
          <p className="text-zinc-400">Master development tools and enhance your workflow</p>
          
          {/* Toggle */}
          <div className="inline-flex rounded-lg p-0.5 bg-zinc-900/80 border border-zinc-800/80">
            <button
              onClick={() => setShowMixed(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !showMixed 
                ? 'bg-blue-600/20 text-blue-400 shadow-lg border border-blue-500/20' 
                : 'text-zinc-400 hover:text-blue-400/80'
              }`}
            >
              Tools
            </button>
            <button
              onClick={() => setShowMixed(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                showMixed 
                ? 'bg-gradient-to-r from-blue-600/20 to-pink-600/20 text-transparent bg-clip-text border border-blue-500/10 border-r-pink-500/10 shadow-lg' 
                : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className={showMixed ? 'bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text' : ''}>
                Mixed
              </span>
            </button>
          </div>
        </div>

        {/* Tool Cards */}
        <div className={`grid ${showMixed ? 'grid-cols-1 max-w-[600px]' : 'grid-cols-4'} gap-6 mb-12 max-w-[1400px] w-full mx-auto`}>
          {(showMixed ? MIXED_TOOLS : TOOLS).map((tool) => (
            <Link 
              key={tool.id}
              href={`/best-practices/${tool.id}`}
              className="group"
            >
              <Card className="relative bg-zinc-900 border-zinc-800/50 hover:border-blue-800/50 transition-all duration-300 h-[280px] overflow-hidden rounded-xl">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,_rgba(59,130,246,0.1)_0,_transparent_50%)] opacity-70"></div>
                <div className="absolute inset-0" style={{ 
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.857 8.485 15.272 9.9l9.9-9.9h-2.83zM32 0l-3.486 3.485-1.414-1.414L30.587 0H32zM0 0c2.116 0 4.1.577 5.798 1.583l-.414.414L2.172 5.172 0 3V0zm23.884 0l-1.414 1.414-10.602 10.6L2.272 2.272 3.687.858 0 4.544V2h2.457l3.414-3.414L2 1.457V0h21.884z\' fill=\'%2310B981\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
                  backgroundSize: '60px 60px'
                }}></div>

                <div className="relative p-5 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {'primaryColor' in tool ? (
                      <div className="flex items-center -space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-950/50 border border-blue-800/30 flex items-center justify-center z-10">
                          <CursorIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-pink-950/50 border border-pink-800/30 flex items-center justify-center">
                          <V0DevIcon className="w-6 h-6 text-pink-500" />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-lg bg-${tool.color}-950/50 border border-${tool.color}-800/30 flex items-center justify-center`}>
                        <tool.icon className={`w-6 h-6 text-${tool.color}-500`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-lg font-semibold truncate transition-colors ${
                        'primaryColor' in tool 
                          ? 'bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text'
                          : tool.id === 'cursor' 
                            ? 'text-blue-400 group-hover:text-blue-300'
                            : tool.id === 'cline'
                            ? 'text-blue-400 group-hover:text-blue-300'
                            : tool.id === 'roocode'
                            ? 'text-purple-400 group-hover:text-purple-300'
                            : 'text-pink-400 group-hover:text-pink-300'
                      }`}>
                        {tool.name}
                      </h2>
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  {/* Practice Count */}
                  <div className="mt-6">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-full gap-2 bg-zinc-900/80 border border-zinc-800/30">
                      <Sparkles className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-medium text-zinc-300">
                        {tool.practiceCount} Best Practice{tool.practiceCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-6">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/30 bg-zinc-900/30 transition-all duration-300 group-hover:border-zinc-700/30">
                      <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300">
                        View Best Practices
                      </span>
                      <svg 
                        className="w-5 h-5 text-zinc-500 group-hover:text-zinc-400 transform group-hover:translate-x-1 transition-all"
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Add Best Practice Button */}
        <Button 
          asChild
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
        >
          <Link href="/best-practices/add" className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Best Practice
          </Link>
        </Button>
      </div>
    </div>
  );
} 