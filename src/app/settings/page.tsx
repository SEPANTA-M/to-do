import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Settings
        </h1>
        <p className="text-sm text-text-secondary">
          Customize your NEXUS experience
        </p>
      </header>
      
      <div className="bg-bg-elevated border border-border-primary rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-5 w-5 text-text-tertiary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Settings Panel
          </h2>
        </div>
        <p className="text-sm text-text-secondary">
          Settings configuration will be implemented in future phases.
        </p>
      </div>
    </div>
  );
}
