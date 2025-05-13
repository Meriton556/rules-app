import { NextResponse } from 'next/server'

// This would typically be in a database
let rules = [
  {
    id: 1,
    title: "TypeScript Best Practices for React Applications",
    description: "You are an expert in TypeScript, React, and modern frontend development. These rules will help you write clean, maintainable code.",
    content: `
# TypeScript Best Practices for React Applications

## 1. Use Proper Type Annotations
Always define proper types for props and state:

\`\`\`typescript
interface UserProps {
  name: string;
  age: number;
  email?: string; // Optional prop
}

const UserProfile: React.FC<UserProps> = ({ name, age, email }) => {
  // Component implementation
};
\`\`\`

## 2. Leverage TypeScript's Type Inference
TypeScript is smart enough to infer types in many cases:

\`\`\`typescript
// Good - TypeScript infers the type
const [count, setCount] = useState(0);

// Only add type annotation when needed
const [user, setUser] = useState<User | null>(null);
\`\`\`

## 3. Use Discriminated Unions for State Management
When dealing with different states:

\`\`\`typescript
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };
\`\`\`
    `,
    author: "alex",
    authorName: "Alex Chen",
    tags: ["typescript", "react", "Frontend"],
    category: "TypeScript",
    createdAt: "2024-03-20",
    count: "+12 rules",
  }
]

export async function GET() {
  return NextResponse.json(rules)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newRule = {
    id: rules.length + 1,
    ...body,
    createdAt: new Date().toISOString().split('T')[0],
    count: "+1 rules",
  }
  
  rules.push(newRule)
  
  return NextResponse.json(newRule, { status: 201 })
} 