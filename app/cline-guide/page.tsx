import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClineGuidePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">Cline Best Practices Guide</h1>
      <p className="text-zinc-400 mb-8">Optimize your development with Cline's powerful features</p>

      <div className="space-y-8">
        {/* Getting Started Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Getting Started with Cline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Basic Setup</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Install Cline via npm or yarn</li>
              <li>Configure your API key in the settings</li>
              <li>Set up your project preferences</li>
              <li>Familiarize yourself with the command palette</li>
            </ul>
          </CardContent>
        </Card>

        {/* AI Features Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">AI-Powered Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Smart Assistance</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Code generation with natural language prompts</li>
              <li>Intelligent code completion</li>
              <li>Automated documentation generation</li>
              <li>Context-aware suggestions</li>
            </ul>
          </CardContent>
        </Card>

        {/* Project Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Project Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Organization Tips</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use project templates for quick setup</li>
              <li>Implement consistent folder structures</li>
              <li>Maintain clear documentation</li>
              <li>Utilize version control integration</li>
            </ul>
          </CardContent>
        </Card>

        {/* Collaboration Features Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Team Collaboration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Working Together</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Share project configurations</li>
              <li>Use collaborative coding features</li>
              <li>Implement code review workflows</li>
              <li>Maintain consistent coding standards</li>
            </ul>
          </CardContent>
        </Card>

        {/* Performance Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Performance Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-xl font-semibold">Best Practices</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Regular cache clearing</li>
              <li>Optimize extension usage</li>
              <li>Configure auto-save settings</li>
              <li>Use workspace-specific settings</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 