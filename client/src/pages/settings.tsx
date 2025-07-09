import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, Brain, User, Bell, Shield, Database, Zap, FileText, Trash2, Download } from "lucide-react";
import UploadArea from "@/components/upload-area";

interface AgentSettings {
  name: string;
  personality: string;
  responseStyle: string;
  creativity: number;
  verbosity: number;
  specialization: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
}

interface UserSettings {
  notifications: boolean;
  emailAlerts: boolean;
  autoSave: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
  storageAlerts: boolean;
  processingPriority: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  dataRetention: number;
  encryptionLevel: string;
  accessLogging: boolean;
  ipWhitelist: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("agent");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Agent Settings State
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    name: "BPN Intelligence Assistant",
    personality: "professional",
    responseStyle: "detailed",
    creativity: 70,
    verbosity: 60,
    specialization: "business",
    systemPrompt: "You are a professional business intelligence assistant for BPN Rwanda. Provide strategic insights, analyze documents, and help with business decisions.",
    temperature: 0.7,
    maxTokens: 2000,
    contextWindow: 4000,
  });

  // User Settings State
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: true,
    emailAlerts: true,
    autoSave: true,
    darkMode: false,
    language: "english",
    timezone: "Africa/Kigali",
    storageAlerts: true,
    processingPriority: "balanced",
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 8,
    dataRetention: 90,
    encryptionLevel: "aes256",
    accessLogging: true,
    ipWhitelist: "",
  });

  // Save Settings Mutations
  const saveAgentSettings = useMutation({
    mutationFn: async (settings: AgentSettings) => {
      return apiRequest("/api/settings/agent", {
        method: "POST",
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Agent settings saved",
        description: "Your AI assistant has been configured successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error saving settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const saveUserSettings = useMutation({
    mutationFn: async (settings: UserSettings) => {
      return apiRequest("/api/settings/user", {
        method: "POST",
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "User settings saved",
        description: "Your preferences have been updated.",
      });
    },
  });

  const saveSecuritySettings = useMutation({
    mutationFn: async (settings: SecuritySettings) => {
      return apiRequest("/api/settings/security", {
        method: "POST",
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      toast({
        title: "Security settings saved",
        description: "Your security configuration has been updated.",
      });
    },
  });

  const clearKnowledgeBase = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/knowledge/clear", {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Knowledge base cleared",
        description: "All training data has been removed.",
      });
    },
  });

  const exportData = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/data/export", {
        method: "GET",
      });
    },
    onSuccess: () => {
      toast({
        title: "Data exported",
        description: "Your data has been prepared for download.",
      });
    },
  });

  const handleUploadComplete = () => {
    toast({
      title: "Files uploaded",
      description: "Your files have been added to the agent's knowledge base.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your BPN Intelligence assistant and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agent" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Agent
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            User
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* Agent Settings Tab */}
        <TabsContent value="agent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Agent Personality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    value={agentSettings.name}
                    onChange={(e) => setAgentSettings({...agentSettings, name: e.target.value})}
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select value={agentSettings.specialization} onValueChange={(value) => setAgentSettings({...agentSettings, specialization: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business Strategy</SelectItem>
                      <SelectItem value="finance">Finance & Accounting</SelectItem>
                      <SelectItem value="marketing">Marketing & Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="legal">Legal & Compliance</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="general">General Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="personality">Personality</Label>
                  <Select value={agentSettings.personality} onValueChange={(value) => setAgentSettings({...agentSettings, personality: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select personality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="responseStyle">Response Style</Label>
                  <Select value={agentSettings.responseStyle} onValueChange={(value) => setAgentSettings({...agentSettings, responseStyle: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select response style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="bullet-points">Bullet Points</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={agentSettings.systemPrompt}
                  onChange={(e) => setAgentSettings({...agentSettings, systemPrompt: e.target.value})}
                  placeholder="Enter system prompt for your agent"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Advanced Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Creativity Level: {agentSettings.creativity}%</Label>
                <Slider
                  value={[agentSettings.creativity]}
                  onValueChange={(value) => setAgentSettings({...agentSettings, creativity: value[0]})}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Higher values make responses more creative and varied</p>
              </div>

              <div>
                <Label>Response Length: {agentSettings.verbosity}%</Label>
                <Slider
                  value={[agentSettings.verbosity]}
                  onValueChange={(value) => setAgentSettings({...agentSettings, verbosity: value[0]})}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Controls how verbose the agent's responses are</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={agentSettings.temperature}
                    onChange={(e) => setAgentSettings({...agentSettings, temperature: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="100"
                    max="4000"
                    value={agentSettings.maxTokens}
                    onChange={(e) => setAgentSettings({...agentSettings, maxTokens: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="contextWindow">Context Window</Label>
                  <Input
                    id="contextWindow"
                    type="number"
                    min="1000"
                    max="8000"
                    value={agentSettings.contextWindow}
                    onChange={(e) => setAgentSettings({...agentSettings, contextWindow: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Button 
                onClick={() => saveAgentSettings.mutate(agentSettings)}
                disabled={saveAgentSettings.isPending}
                className="w-full"
              >
                {saveAgentSettings.isPending ? "Saving..." : "Save Agent Settings"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Knowledge Base Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload documents to train your agent and improve its knowledge about your business.
                </p>
                <UploadArea onUploadComplete={handleUploadComplete} />
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    {uploadedFiles.length} files uploaded
                  </Badge>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => clearKnowledgeBase.mutate()}
                    disabled={clearKnowledgeBase.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Knowledge Base
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Settings Tab */}
        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications for completed processing</p>
                </div>
                <Switch
                  id="notifications"
                  checked={userSettings.notifications}
                  onCheckedChange={(checked) => setUserSettings({...userSettings, notifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailAlerts">Email Alerts</Label>
                  <p className="text-sm text-gray-500">Get email notifications for important updates</p>
                </div>
                <Switch
                  id="emailAlerts"
                  checked={userSettings.emailAlerts}
                  onCheckedChange={(checked) => setUserSettings({...userSettings, emailAlerts: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="storageAlerts">Storage Alerts</Label>
                  <p className="text-sm text-gray-500">Notify when approaching storage limits</p>
                </div>
                <Switch
                  id="storageAlerts"
                  checked={userSettings.storageAlerts}
                  onCheckedChange={(checked) => setUserSettings({...userSettings, storageAlerts: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={userSettings.language} onValueChange={(value) => setUserSettings({...userSettings, language: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="kinyarwanda">Kinyarwanda</SelectItem>
                      <SelectItem value="swahili">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={userSettings.timezone} onValueChange={(value) => setUserSettings({...userSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kigali">Africa/Kigali</SelectItem>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                      <SelectItem value="Africa/Kampala">Africa/Kampala</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="processingPriority">Processing Priority</Label>
                <Select value={userSettings.processingPriority} onValueChange={(value) => setUserSettings({...userSettings, processingPriority: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speed">Speed (Faster processing)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="accuracy">Accuracy (Better results)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSave">Auto-save Conversations</Label>
                  <p className="text-sm text-gray-500">Automatically save chat history</p>
                </div>
                <Switch
                  id="autoSave"
                  checked={userSettings.autoSave}
                  onCheckedChange={(checked) => setUserSettings({...userSettings, autoSave: checked})}
                />
              </div>

              <Button 
                onClick={() => saveUserSettings.mutate(userSettings)}
                disabled={saveUserSettings.isPending}
                className="w-full"
              >
                {saveUserSettings.isPending ? "Saving..." : "Save User Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="1"
                  max="24"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                <Textarea
                  id="ipWhitelist"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                  placeholder="Enter IP addresses (one per line)"
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dataRetention">Data Retention Period (days)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  min="1"
                  max="365"
                  value={securitySettings.dataRetention}
                  onChange={(e) => setSecuritySettings({...securitySettings, dataRetention: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="encryptionLevel">Encryption Level</Label>
                <Select value={securitySettings.encryptionLevel} onValueChange={(value) => setSecuritySettings({...securitySettings, encryptionLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select encryption level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aes128">AES-128</SelectItem>
                    <SelectItem value="aes256">AES-256</SelectItem>
                    <SelectItem value="rsa2048">RSA-2048</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="accessLogging">Access Logging</Label>
                  <p className="text-sm text-gray-500">Log all system access attempts</p>
                </div>
                <Switch
                  id="accessLogging"
                  checked={securitySettings.accessLogging}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, accessLogging: checked})}
                />
              </div>

              <Button 
                onClick={() => saveSecuritySettings.mutate(securitySettings)}
                disabled={saveSecuritySettings.isPending}
                className="w-full"
              >
                {saveSecuritySettings.isPending ? "Saving..." : "Save Security Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline"
                  onClick={() => exportData.mutate()}
                  disabled={exportData.isPending}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {exportData.isPending ? "Exporting..." : "Export Data"}
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={() => clearKnowledgeBase.mutate()}
                  disabled={clearKnowledgeBase.isPending}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {clearKnowledgeBase.isPending ? "Clearing..." : "Clear All Data"}
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Data Usage</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span>24 files</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used:</span>
                    <span>1.2 GB / 2.5 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages:</span>
                    <span>156 conversations</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}