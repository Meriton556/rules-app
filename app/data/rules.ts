export interface Rule {
  id: number;
  title: string;
  description: string;
  content: string;
  author: string;
  authorName: string;
  tags: string[];
  category: string;
  createdAt: string;
  isOfficial: boolean;
  isGeneral: boolean; // New field for general rule type
  forkFrom?: number; // Optional reference to parent rule ID if this is a variant
  votes?: number; // Track community voting
}

export const rules: Rule[] = [
  {
    id: 1,
    title: "TypeScript Type Guards and Type Narrowing",
    description: "Learn how to effectively use TypeScript type guards and type narrowing for better type safety.",
    content: `
# TypeScript Type Guards and Type Narrowing

## 1. User-Defined Type Guards
Create functions that help TypeScript narrow down types:

\`\`\`typescript
interface Bird {
  type: 'bird';
  flies: boolean;
  chirps: boolean;
}

interface Dog {
  type: 'dog';
  barks: boolean;
  wags: boolean;
}

type Animal = Bird | Dog;

// Type guard function
function isBird(animal: Animal): animal is Bird {
  return animal.type === 'bird';
}

function handleAnimal(animal: Animal) {
  if (isBird(animal)) {
    // TypeScript knows this is a Bird
    console.log(animal.chirps);
  } else {
    // TypeScript knows this is a Dog
    console.log(animal.barks);
  }
}
\`\`\`

## 2. Using instanceof and typeof
Built-in type guards for runtime checks:

\`\`\`typescript
function processValue(value: string | number | Date) {
  if (value instanceof Date) {
    // TypeScript knows this is a Date
    return value.toISOString();
  }
  
  if (typeof value === 'string') {
    // TypeScript knows this is a string
    return value.toUpperCase();
  }
  
  // TypeScript knows this is a number
  return value.toFixed(2);
}
\`\`\`

## 3. Discriminated Unions
Use literal types as discriminators:

\`\`\`typescript
type Success = { kind: 'success'; data: string };
type Error = { kind: 'error'; message: string };
type Loading = { kind: 'loading' };

type State = Success | Error | Loading;

function handleState(state: State) {
  switch (state.kind) {
    case 'success':
      return state.data;
    case 'error':
      return state.message;
    case 'loading':
      return 'Loading...';
  }
}
\`\`\`
    `,
    author: "alex",
    authorName: "Alex Chen",
    tags: ["typescript", "type-safety", "advanced"],
    category: "TypeScript",
    createdAt: "2024-03-20",
    isOfficial: true,
    isGeneral: false,
    votes: 12
  },
  {
    id: 2,
    title: "React Performance Optimization Techniques",
    description: "Essential techniques for optimizing React application performance and reducing unnecessary renders.",
    content: `
# React Performance Optimization Techniques

## 1. Memoization with useMemo and useCallback
Prevent unnecessary recalculations and re-renders:

\`\`\`typescript
function UserList({ users, onUserSelect }) {
  // Memoize expensive calculations
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.score - a.score);
  }, [users]);

  // Memoize callbacks
  const handleSelect = useCallback((userId: string) => {
    onUserSelect(userId);
  }, [onUserSelect]);

  return (
    <ul>
      {sortedUsers.map(user => (
        <UserItem
          key={user.id}
          user={user}
          onSelect={handleSelect}
        />
      ))}
    </ul>
  );
}
\`\`\`

## 2. React.memo for Component Optimization
Prevent unnecessary re-renders of components:

\`\`\`typescript
interface UserItemProps {
  user: User;
  onSelect: (id: string) => void;
}

const UserItem = React.memo(({ user, onSelect }: UserItemProps) => {
  return (
    <li onClick={() => onSelect(user.id)}>
      {user.name} - {user.score}
    </li>
  );
});
\`\`\`

## 3. Virtualization for Large Lists
Use virtualization for efficient rendering of large lists:

\`\`\`typescript
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      Item {items[index]}
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      width={300}
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`
    `,
    author: "sarah",
    authorName: "Sarah Johnson",
    tags: ["react", "performance", "optimization"],
    category: "React",
    createdAt: "2024-03-21",
    isOfficial: true,
    isGeneral: false,
    votes: 15
  },
  {
    id: 3,
    title: "Next.js Server Components Best Practices",
    description: "Learn how to effectively use Next.js Server Components and understand their benefits and trade-offs.",
    content: `
# Next.js Server Components Best Practices

## 1. When to Use Server Components
Server Components are ideal for:

\`\`\`typescript
// Good use case for Server Component
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.users.findUnique({ 
    where: { id: userId } 
  });

  return (
    <div>
      <h1>{user.name}</h1>
      <ClientSideInteractions />
    </div>
  );
}

// Keep interactive parts client-side
'use client'
function ClientSideInteractions() {
  const [isEditing, setIsEditing] = useState(false);
  // ...
}
\`\`\`

## 2. Data Fetching Patterns
Optimize data fetching in Server Components:

\`\`\`typescript
async function Dashboard() {
  // Parallel data fetching
  const [users, posts, analytics] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchAnalytics()
  ]);

  return (
    <div>
      <UserList users={users} />
      <PostGrid posts={posts} />
      <AnalyticsDashboard data={analytics} />
    </div>
  );
}
\`\`\`

## 3. Component Architecture
Structure your components effectively:

\`\`\`typescript
// pages/dashboard.tsx
export default async function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}

// Keep shared layouts server-side
async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  
  return (
    <div>
      <Sidebar user={user} />
      <main>{children}</main>
    </div>
  );
}
\`\`\`
    `,
    author: "mike",
    authorName: "Mike Wilson",
    tags: ["next.js", "server-components", "performance"],
    category: "Next.js",
    createdAt: "2024-03-22",
    isOfficial: true,
    isGeneral: false,
    votes: 8
  }
]; 