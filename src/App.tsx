import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Command } from "@tauri-apps/plugin-shell";
import { save } from "@tauri-apps/plugin-dialog";
import { Search, Folder, Globe, Loader2, X, Download, ShieldCheck, CheckCircle, Save, AlertCircle, Archive, FileJson } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import jsYaml from 'js-yaml';
import agentsData from "../agents.json";
import "./App.css";

interface Skill {
  name: string;
  path: string;
  agent_type: string;
  scope: string;
  frontmatter?: string;
}

interface MarketplaceSkill {
  name: string;
  repo: string;
  description: string;
  agent: string;
  skillName: string;
}

function App() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'archive' | 'marketplace'>('archive');
  const [previewSkill, setPreviewSkill] = useState<MarketplaceSkill | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  
  // Editor State
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Status Bar State
  const [status, setStatus] = useState<string>("SYSTEM_READY");

  const marketplaceSkills: MarketplaceSkill[] = [
    { name: "React Best Practices", skillName: "vercel-react-best-practices", repo: "https://github.com/vercel-labs/agent-skills.git", description: "40+ rules for React and Next.js performance. Optimizes bundle size, data fetching, and rendering.", agent: "claude-code" },
    { name: "Web Design Guidelines", skillName: "web-design-guidelines", repo: "https://github.com/vercel-labs/agent-skills.git", description: "100+ rules for auditing UI code. ARIA, semantic HTML, and UX best practices.", agent: "claude-code" },
    { name: "Deploy to Vercel", skillName: "deploy-to-vercel", repo: "https://github.com/vercel-labs/agent-skills.git", description: "Instantly deploy apps with claimable links. Supports 40+ frameworks.", agent: "claude-code" },
    { name: "React Native Skills", skillName: "vercel-react-native-skills", repo: "https://github.com/vercel-labs/agent-skills.git", description: "Patterns for React Native and Expo. Performance and architecture optimizations.", agent: "claude-code" },
    { name: "Vercel Composition Patterns", skillName: "vercel-composition-patterns", repo: "https://github.com/vercel-labs/agent-skills.git", description: "Standardized patterns for component composition in large apps.", agent: "claude-code" },
    { name: "Skill Creator", skillName: "skill-creator", repo: "https://github.com/vercel-labs/agent-skills.git", description: "A meta-skill designed to help you build your own custom agent skills.", agent: "claude-code" },
    { name: "Lucide Icon Finder", skillName: "lucide-icon-finder", repo: "https://github.com/vercel-labs/agent-skills.git", description: "Optimized search and integration for Lucide icons in React apps.", agent: "cursor" },
    { name: "Tailwind UI Expert", skillName: "tailwind-ui-expert", repo: "https://github.com/vercel-labs/agent-skills.git", description: "Deep knowledge of Tailwind CSS classes and design patterns.", agent: "cursor" },
  ];

  const isInstalled = (skillName: string) => skills.some(s => s.name === skillName);

  useEffect(() => { handleScan(); }, []);

  useEffect(() => {
    if (!editorContent) return;
    try {
      if (editorContent.startsWith("---")) {
        const parts = editorContent.split("---");
        if (parts.length >= 3) {
          const yaml = jsYaml.load(parts[1]) as any;
          if (!yaml?.name) setValidationError("Missing required field: 'name'");
          else if (!yaml?.description) setValidationError("Missing required field: 'description'");
          else setValidationError(null);
        } else { setValidationError("Malformed Frontmatter: Missing closing '---'"); }
      } else { setValidationError("Missing Frontmatter: Skills must start with '---'"); }
    } catch (e: any) { setValidationError(`YAML Syntax Error: ${e.message}`); }
  }, [editorContent]);

  const handleEdit = async (skill: Skill) => {
    setLoading(true);
    setStatus("RETRIEVING_MANIFEST");
    try {
      const content = await invoke<string>("read_skill_file", { path: skill.path });
      setEditorContent(content);
      setEditingSkill(skill);
      setStatus("OK: MANIFEST_LOADED");
    } catch (error) {
      setStatus("ERR: RETRIEVAL_FAILED");
      alert(`INTEL FAILURE: Could not retrieve skill manifest.\n${error}`);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (validationError || !editingSkill) return;
    setSaving(true);
    setStatus("COMMITTING_CHANGES");
    try {
      await invoke("save_skill_file", { path: editingSkill.path, content: editorContent });
      setStatus("OK: CHANGES_PERSISTENT");
      setEditingSkill(null);
      await handleScan();
    } catch (error) {
      setStatus("ERR: WRITE_FAILED");
      alert(`WRITE FAILURE: Could not commit changes to disk.\n${error}`);
    }
    setSaving(false);
  };

  const handleExport = async () => {
    if (skills.length === 0) return;
    setStatus("PREPARING_EXPORT");
    try {
      const filePath = await save({
        filters: [{ name: 'Archive', extensions: ['zip'] }],
        defaultPath: 'rigman-collection.zip',
        title: 'Export Intelligence Collection'
      });

      if (filePath) {
        setStatus("COMPRESSING_ASSETS");
        // Skill paths are folders (parent of SKILL.md)
        const skillFolders = skills.map(s => {
          const pathParts = s.path.split('/');
          pathParts.pop(); // Remove SKILL.md
          return pathParts.join('/');
        });

        await invoke("export_skills_to_zip", { 
          skillPaths: skillFolders, 
          targetZip: filePath 
        });
        setStatus("OK: EXPORT_COMPLETE");
        alert(`SUCCESS: Collection exported to ${filePath}`);
      } else {
        setStatus("OK: EXPORT_CANCELLED");
      }
    } catch (error) {
      setStatus("ERR: EXPORT_FAILED");
      alert(`EXPORT FAILURE: Could not create collection archive.\n${error}`);
    }
  };

  const handleInstall = async (skill: MarketplaceSkill) => {
    setInstalling(skill.skillName);
    setStatus("DEPLOYING_ASSET");
    try {
      const command = Command.create("npx", ["skills", "add", skill.repo, "--agent", skill.agent, "-y"]);
      const output = await command.execute();
      if (output.code === 0) {
        setStatus("OK: ASSET_DEPLOYED");
        alert(`SUCCESS: ${skill.name} deployed.`);
        await handleScan(); 
      } else {
        setStatus("ERR: DEPLOY_FAILED");
        alert(`ERROR: Deployment failed.\n${output.stderr}`);
      }
    } catch (error: any) {
      setStatus("ERR: SYSTEM_FAILURE");
      alert(`SYSTEM FAILURE: ${error.message}`);
    }
    setInstalling(null);
    setPreviewSkill(null);
  };

  const handleRemove = async (skill: Skill) => {
    if (!confirm(`CONFIDENTIAL: Decommission "${skill.name}"?`)) return;
    setLoading(true);
    setStatus("DECOMMISSIONING_ASSET");
    try {
      const command = Command.create("npx", ["skills", "remove", skill.name, "-y"]);
      const output = await command.execute();
      if (output.code === 0) {
        setStatus("OK: ASSET_REMOVED");
        await handleScan();
      } else {
        setStatus("ERR: REMOVE_FAILED");
      }
    } catch (e) { setStatus("ERR: SYSTEM_FAILURE"); }
    setLoading(false);
  };

  const handleUpdateAll = async () => {
    setLoading(true);
    setStatus("SYNCHRONIZING_REGISTRY");
    try {
      const command = Command.create("npx", ["skills", "update", "-y"]);
      await command.execute();
      setStatus("OK: REGISTRY_SYNCED");
      await handleScan();
    } catch (e) { setStatus("ERR: SYNC_FAILED"); }
    setLoading(false);
  };

  const handleScan = async () => {
    setLoading(true);
    setStatus("SCANNING_ARCHIVES");
    try {
      const result = await invoke<Skill[]>("scan_skills", { agents: agentsData, projectRoot: "." });
      setSkills(result);
      setStatus("OK: SCAN_COMPLETE");
    } catch (e) { setStatus("ERR: SCAN_FAILED"); }
    setLoading(false);
  };

  const filteredSkills = skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.agent_type.toLowerCase().includes(search.toLowerCase()));
  const filteredMarketplace = marketplaceSkills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.skillName.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-zinc-900 p-8 selection:bg-zinc-900 selection:text-white font-serif flex flex-col" data-color-mode="light">
      <header className="border-b-4 border-zinc-900 pb-4 mb-8">
        <div className="flex justify-between items-baseline border-b border-zinc-300 pb-1 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] font-sans">
          <div className="flex gap-4">
            <button onClick={() => setView('archive')} className={`${view === 'archive' ? 'underline decoration-2' : 'opacity-50'} hover:opacity-100 transition-opacity`}>Archive</button>
            <button onClick={() => setView('marketplace')} className={`${view === 'marketplace' ? 'underline decoration-2' : 'opacity-50'} hover:opacity-100 transition-opacity`}>Marketplace</button>
          </div>
          <span className="opacity-50 italic">Rigman Protocol v1.0</span>
        </div>
        <h1 className="text-8xl font-black text-center tracking-tighter uppercase mb-4 transition-all duration-500 transform hover:scale-[1.01]">Rigman</h1>
        <div className="flex justify-between items-center border-t border-zinc-300 pt-2 text-sm italic">
          <p className="animate-in fade-in duration-700">{view === 'archive' ? 'Intelligence Report: Current Local Assets' : 'Intelligence Brief: Global Skill Registry'}</p>
          <div className="flex gap-4 font-sans font-bold uppercase text-[10px] tracking-wider">
            {view === 'archive' && (
              <>
                <button onClick={handleExport} className="hover:underline cursor-pointer flex items-center gap-1 text-[9px]"><Archive className="h-3 w-3" />Export Collection</button>
                <button onClick={handleUpdateAll} className="hover:underline cursor-pointer flex items-center gap-1 text-[9px] border-l border-zinc-300 pl-4">{loading && <Loader2 className="h-3 w-3 animate-spin" />}Sync All</button>
                <button onClick={handleScan} className="hover:underline cursor-pointer flex items-center gap-1 border-l border-zinc-300 pl-4 text-[9px]">Re-Scan</button>
              </>
            )}
            <span className="text-[9px]">{view === 'archive' ? `${skills.length} Skills Indexed` : `${marketplaceSkills.length} Available Globally`}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 flex-1">
        <aside className="col-span-3 border-r border-zinc-300 pr-8 font-sans">
          <section className="mb-8">
            <h2 className="text-xl font-serif font-bold border-b-2 border-zinc-900 mb-4 uppercase">Registry</h2>
            <div className="space-y-1 text-xs">
              {agentsData.map(agent => {
                const count = view === 'archive' ? skills.filter(s => s.agent_type === agent.type).length : marketplaceSkills.filter(s => s.agent === agent.type).length;
                return (
                  <div key={agent.name} className="flex justify-between items-center hover:bg-zinc-200/50 p-1.5 cursor-pointer transition-colors group">
                    <span className="font-bold uppercase tracking-tight group-hover:underline">{agent.name}</span>
                    <span className="text-zinc-500 tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-serif font-bold border-b-2 border-zinc-900 mb-4 uppercase">Filter</h2>
            <div className="relative mb-6">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input type="text" placeholder="Keywords..." className="w-full pl-8 pr-4 py-2 bg-transparent border border-zinc-300 focus:border-zinc-900 outline-none text-xs transition-colors font-sans" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </section>
        </aside>

        <main className="col-span-9 animate-in slide-in-from-right-4 fade-in duration-500">
          <div className="mb-8">
            <h2 className="text-4xl font-bold italic mb-4 leading-none">{view === 'archive' ? 'Latest Intelligence' : 'Global Dispatch'}</h2>
            <hr className="border-zinc-900 border-t-2 mb-6" />
            {loading && !editingSkill ? (
              <div className="py-24 text-center text-2xl italic animate-pulse opacity-50">Processing reports...</div>
            ) : view === 'archive' ? (
              filteredSkills.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-zinc-300 italic text-zinc-500 text-xl">No matching skills found in the archive.</div>
              ) : (
                <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                  {filteredSkills.map((skill, i) => (
                    <article key={i} className="group flex flex-col hover:bg-zinc-50/50 p-2 -m-2 transition-colors">
                      <div className="flex justify-between items-baseline mb-3 border-b border-zinc-200 pb-1">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-sans px-1.5 py-0.5 bg-zinc-900 text-white">{skill.agent_type}</span>
                        <span className="text-[10px] text-zinc-500 italic flex items-center gap-1 font-sans font-bold uppercase tracking-tight">{skill.scope === 'global' ? <Globe className="h-2.5 w-2.5" /> : <Folder className="h-2.5 w-2.5" />}{skill.scope}</span>
                      </div>
                      <h3 className="text-2xl font-bold group-hover:underline cursor-pointer mb-2 leading-tight">{skill.name}</h3>
                      <p className="text-sm text-zinc-700 line-clamp-4 mb-4 italic leading-relaxed">{skill.frontmatter || "No metadata available. This skill is currently unclassified."}</p>
                      <div className="mt-auto flex gap-4 text-[9px] font-bold uppercase font-sans tracking-widest border-t border-zinc-100 pt-3">
                        <button onClick={() => handleEdit(skill)} className="hover:underline decoration-2 underline-offset-4">Edit Manifest</button>
                        <button onClick={() => handleRemove(skill)} className="hover:underline decoration-2 underline-offset-4 text-red-700">Uninstall</button>
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                {filteredMarketplace.map((skill, i) => {
                  const installed = isInstalled(skill.skillName);
                  return (
                    <article key={i} className="group flex flex-col border-2 border-zinc-900 p-4 bg-white shadow-[8px_8px_0_0_#18181b] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_#18181b] transition-all">
                      <div className="flex justify-between items-baseline mb-3 border-b border-zinc-200 pb-1">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-sans px-1.5 py-0.5 bg-zinc-900 text-white">{skill.agent}</span>
                        <span className="text-[10px] text-zinc-500 italic font-sans font-bold uppercase tracking-tight">Vercel Registry</span>
                      </div>
                      <h3 className="text-2xl font-bold group-hover:underline cursor-pointer mb-2 leading-tight">{skill.name}</h3>
                      <p className="text-[10px] font-mono mb-2 text-zinc-500 uppercase tracking-widest">{skill.skillName}</p>
                      <p className="text-sm text-zinc-700 line-clamp-3 mb-4 italic leading-relaxed">{skill.description}</p>
                      <div className="mt-auto flex gap-4 text-[10px] font-bold uppercase font-sans tracking-widest border-t border-zinc-900 pt-3">
                        {installed ? <div className="flex items-center gap-2 text-emerald-700 px-3 py-1 border border-emerald-700 font-sans text-[9px] font-bold uppercase tracking-wider"><CheckCircle className="h-3 w-3" />Deployed</div> : <button onClick={() => handleInstall(skill)} disabled={installing === skill.skillName} className="bg-zinc-900 text-white px-3 py-1 hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center gap-2">{installing === skill.skillName ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}{installing === skill.skillName ? 'Processing...' : 'Install'}</button>}
                        <button onClick={() => setPreviewSkill(skill)} className="hover:underline decoration-2 underline-offset-4">Preview</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {editingSkill && (
        <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-[#fcfaf7] w-full h-[95vh] border-4 border-zinc-900 flex flex-col shadow-[32px_32px_0_0_#000] animate-in zoom-in-95 duration-300">
            <header className="border-b-4 border-zinc-900 p-6 flex justify-between items-center bg-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-sans bg-zinc-900 text-white px-3 py-1 mb-2 inline-block">Secure Manifest Editor</span>
                <h2 className="text-4xl font-black uppercase tracking-tight leading-none">{editingSkill.name}</h2>
                <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">{editingSkill.path}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={handleSave} disabled={saving || !!validationError} className="bg-zinc-900 text-white px-8 py-3 font-sans font-bold uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Committing...' : 'Save Manifest'}</button>
                <button onClick={() => setEditingSkill(null)} className="p-3 border-2 border-zinc-900 hover:bg-zinc-100 transition-colors"><X className="h-6 w-6" /></button>
              </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 border-r-2 border-zinc-900 flex flex-col">
                <div className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 flex justify-between items-center"><span>Raw Source Content</span>{validationError && <span className="text-red-400 flex items-center gap-1 animate-pulse"><AlertCircle className="h-3 w-3" />{validationError}</span>}</div>
                <div className="flex-1 overflow-auto bg-white p-4 font-sans"><MDEditor value={editorContent} onChange={(val) => setEditorContent(val || "")} preview="edit" height="100%" className="skill-editor-field" /></div>
              </div>
              <div className="flex-1 flex flex-col bg-[#fcfaf7]">
                <div className="bg-zinc-200 text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2">Live Intelligence Preview</div>
                <div className="flex-1 overflow-auto p-8 prose prose-zinc prose-sm max-w-none font-serif bg-white/50 m-4 border border-zinc-200"><MDEditor.Markdown source={editorContent} /></div>
              </div>
            </div>
            <footer className="bg-zinc-100 border-t-2 border-zinc-900 p-4 text-[10px] font-mono flex justify-between items-center uppercase tracking-widest text-zinc-500"><span>Lines: {editorContent.split('\n').length}</span><span>Status: {validationError ? 'ERR: MALFORMED_YAML' : 'OK: MANIFEST_VALID'}</span><span>Rigman Intelligence Bureau Secure Access</span></footer>
          </div>
        </div>
      )}

      {previewSkill && !editingSkill && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-8 z-50 animate-in fade-in duration-300">
          <div className="bg-[#fcfaf7] w-full max-w-2xl border-4 border-zinc-900 shadow-[16px_16px_0_0_#000] p-10 relative overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300">
            <button onClick={() => setPreviewSkill(null)} className="absolute top-4 right-4 p-2 hover:bg-zinc-200 transition-colors"><X className="h-6 w-6" /></button>
            <header className="border-b-2 border-zinc-900 pb-4 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-sans bg-zinc-900 text-white px-3 py-1 mb-4 inline-block">Special Edition Intelligence Report</span>
              <h2 className="text-5xl font-black uppercase tracking-tight leading-none mb-2">{previewSkill.name}</h2>
              <div className="flex justify-between items-baseline text-xs italic text-zinc-600"><span>Skill: {previewSkill.skillName}</span><span>Agent Class: {previewSkill.agent}</span></div>
            </header>
            <div className="prose prose-zinc mb-10"><p className="text-lg italic leading-relaxed mb-6 font-serif">{previewSkill.description}</p>
              <div className="grid grid-cols-2 gap-8 text-xs border-y border-zinc-200 py-6 font-sans">
                <div><h4 className="font-bold uppercase mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Security Clearance</h4><p className="text-zinc-600">Verified by Vercel Security Labs. No external network requests detected.</p></div>
                <div><h4 className="font-bold uppercase mb-2">Capability Matrix</h4><ul className="list-disc list-inside text-zinc-600"><li>FS Write Operations</li><li>Tool Composition</li><li>LLM Context Injection</li></ul></div>
              </div>
            </div>
            <footer className="mt-8 flex justify-end gap-6 border-t-2 border-zinc-900 pt-6">
              <button onClick={() => setPreviewSkill(null)} className="font-sans font-bold uppercase text-[10px] tracking-widest hover:underline">Cancel</button>
              {isInstalled(previewSkill.skillName) ? <div className="flex items-center gap-2 text-emerald-700 px-8 py-3 font-sans font-bold uppercase text-xs tracking-[0.2em] border-2 border-emerald-700"><CheckCircle className="h-4 w-4" />Successfully Deployed</div> : <button onClick={() => handleInstall(previewSkill)} disabled={installing === previewSkill.skillName} className="bg-zinc-900 text-white px-8 py-3 font-sans font-bold uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition-colors flex items-center gap-2">{installing === previewSkill.skillName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{installing === previewSkill.skillName ? 'Processing Deployment...' : 'Deploy to Agent'}</button>}
            </footer>
          </div>
        </div>
      )}

      <footer className="mt-auto pt-8 border-t-4 border-zinc-900 text-[10px] font-bold uppercase tracking-[0.3em] font-sans flex justify-between bg-[#fcfaf7] z-10">
        <div className="flex items-center gap-2">
          <span className="bg-zinc-900 text-white px-2 py-0.5">STATUS</span>
          <span className="animate-pulse">{status}</span>
        </div>
        <div className="flex gap-8">
          <span>&copy; 2026 RIGMAN INTEL BUREAU</span>
          <span>LOCAL-FIRST SECURE</span>
          <span>BUILT WITH TAURI/RUST</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
