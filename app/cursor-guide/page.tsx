import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CursorGuidePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">Cursor Best Practices Guide</h1>
      <p className="text-zinc-400 mb-8">Master Cursor to enhance your development workflow</p>

      <div className="space-y-8">
        {/* AI Commands Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">AI Commands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Using the "/" Command</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Type "/" to activate AI commands anywhere in your code</li>
              <li>Use natural language to describe what you want to accomplish</li>
              <li>Examples:
                <ul className="list-disc pl-6 mt-2">
                  <li>/create a React component for a user profile</li>
                  <li>/explain this code block</li>
                  <li>/refactor this function to be more efficient</li>
                </ul>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Code Completion Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Code Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Intelligent Suggestions</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use Tab to accept suggestions</li>
              <li>Press Ctrl+Space to manually trigger suggestions</li>
              <li>Suggestions are context-aware and learn from your codebase</li>
              <li>Multi-line completions available for common patterns</li>
            </ul>
          </CardContent>
        </Card>

        {/* Chat Features Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Chat Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Effective Communication</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use chat for:
                <ul className="list-disc pl-6 mt-2">
                  <li>Code explanations and documentation</li>
                  <li>Debugging assistance</li>
                  <li>Architecture discussions</li>
                  <li>Best practices recommendations</li>
                </ul>
              </li>
              <li>Reference specific code blocks in your questions</li>
              <li>Ask for step-by-step explanations when needed</li>
            </ul>
          </CardContent>
        </Card>

        {/* Code Formatting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Code Formatting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Automatic Formatting</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Format on save is enabled by default</li>
              <li>Use Shift+Alt+F to manually format documents</li>
              <li>Customizable formatting rules via configuration</li>
              <li>Language-specific formatting support</li>
            </ul>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Essential Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Productivity Boosters</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ctrl+P: Quick file navigation</li>
              <li>Ctrl+Shift+P: Command palette</li>
              <li>F12: Go to definition</li>
              <li>Alt+F12: Peek definition</li>
              <li>Ctrl+Space: Trigger suggestions</li>
              <li>Ctrl+/: Toggle line comment</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 