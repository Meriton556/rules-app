"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Edit2, Trash2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import useRules from "@/hooks/useRules"
import { useState } from "react"

export default function RulePage() {
  const params = useParams()
  const router = useRouter()
  const { rules, deleteRule, getRuleVariants } = useRules()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const rule = rules.find((r) => r.id === params.id)
  
  // Get any variant rules that have forked from this one
  const variants = rule ? getRuleVariants(rule.id) : []

  if (!rule) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Rule not found</h1>
          <Link href="/rules">
            <Button variant="outline" className="border-zinc-700">
              Back to Rules
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      deleteRule(rule.id)
      router.push('/rules')
    }
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(rule.content)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/rules">
            <Button variant="outline" className="border-zinc-700 mr-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Rules
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{rule.title}</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="border-zinc-700" onClick={handleCopy}>
            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
          <Link href={`/rules/edit/${rule.id}`}>
            <Button variant="outline" className="border-zinc-700">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center">
            <Avatar className="mr-3">
              <AvatarImage src={`https://avatar.vercel.sh/${rule.author}`} alt={rule.authorName} />
              <AvatarFallback>{rule.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-white font-medium">{rule.authorName}</p>
              <p className="text-xs text-zinc-400">
                {new Date(rule.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={rule.isOfficial ? "default" : "secondary"} className="flex items-center">
              {rule.isOfficial ? "Official" : "Community"}
            </Badge>
            <Badge variant="outline" className="text-zinc-400 border-zinc-700">
              {rule.category}
            </Badge>
          </div>
        </div>
        <div className="p-6">
          <p className="mb-6 text-zinc-300">{rule.description}</p>
          <div 
            className="prose prose-invert prose-code:font-mono prose-code:bg-zinc-800 prose-code:p-1 prose-code:rounded prose-pre:bg-zinc-800/50 prose-pre:p-4 prose-pre:rounded"
            onClick={handleClick}
          >
            <pre className={`whitespace-pre-wrap ${isExpanded ? 'max-h-none' : 'max-h-96 overflow-hidden relative'}`}>
              {rule.content}
              {!isExpanded && rule.content.length > 300 && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent"></div>
              )}
            </pre>
          </div>
          
          {rule.bestPractices && rule.bestPractices.trim() !== '' && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-zinc-200 border-b border-zinc-800 pb-2">
                Best Practices
              </h3>
              <div className="prose prose-invert prose-code:font-mono prose-code:bg-zinc-800 prose-code:p-1 prose-code:rounded prose-pre:bg-zinc-800/50 prose-pre:p-4 prose-pre:rounded">
                <pre className="whitespace-pre-wrap">
                  {rule.bestPractices}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show variants/forks if any exist */}
      {variants.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Community Variants ({variants.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variants.map(variant => (
              <Link href={`/rules/${variant.id}`} key={variant.id}>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{variant.title}</h3>
                    <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                      {new Date(variant.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{variant.description}</p>
                  <div className="flex items-center">
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage src={`https://avatar.vercel.sh/${variant.author}`} alt={variant.authorName} />
                      <AvatarFallback>{variant.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-zinc-400">{variant.authorName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Option to create a variant */}
      <div className="mt-6">
        <Link href={`/rules/new?forkFrom=${rule.id}`}>
          <Button variant="outline" className="border-zinc-700">
            Create Your Variant
          </Button>
        </Link>
      </div>
    </div>
  )
} 