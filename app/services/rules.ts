export interface Rule {
  id: number
  title: string
  description: string
  content: string
  author: string
  authorName: string
  tags: string[]
  category: string
  createdAt: string
  count: string
}

export interface CreateRuleData {
  title: string
  description: string
  content: string
  author: string
  authorName: string
  tags: string[]
  category: string
}

export async function getRules(): Promise<Rule[]> {
  const response = await fetch('/api/rules')
  if (!response.ok) {
    throw new Error('Failed to fetch rules')
  }
  return response.json()
}

export async function createRule(data: CreateRuleData): Promise<Rule> {
  const response = await fetch('/api/rules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create rule')
  }
  
  return response.json()
} 