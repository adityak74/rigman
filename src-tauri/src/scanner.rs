use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentConfig {
    pub name: String,
    pub r#type: String,
    pub global_path: String,
    pub local_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SkillMetadata {
    pub name: String,
    pub path: String,
    pub agent_type: String,
    pub scope: String,
    pub frontmatter: Option<String>,
}

pub fn expand_home(path: &str) -> PathBuf {
    if path.starts_with("~/") {
        if let Some(home_dir) = dirs::home_dir() {
            return home_dir.join(&path[2..]);
        }
    }
    PathBuf::from(path)
}

pub fn scan_for_skills(agents: Vec<AgentConfig>, project_root: &Path) -> Vec<SkillMetadata> {
    let mut skills = Vec::new();

    for agent in agents {
        // Scan Global Path
        let global_path = expand_home(&agent.global_path);
        if global_path.exists() && global_path.is_dir() {
            skills.extend(scan_directory(&global_path, &agent.r#type, "global"));
        }

        // Scan Local Path (relative to project root)
        let local_path = project_root.join(&agent.local_path);
        if local_path.exists() && local_path.is_dir() {
            skills.extend(scan_directory(&local_path, &agent.r#type, "local"));
        }
    }

    skills
}

fn scan_directory(path: &Path, agent_type: &str, scope: &str) -> Vec<SkillMetadata> {
    let mut discovered = Vec::new();

    for entry in WalkDir::new(path)
        .max_depth(3) // Skills are usually in subfolders
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_name() == "SKILL.md" {
            let skill_path = entry.path();
            let content = fs::read_to_string(skill_path).unwrap_or_default();
            
            // Basic frontmatter extraction (naive)
            let frontmatter = if content.starts_with("---") {
                let parts: Vec<&str> = content.split("---").collect();
                if parts.len() >= 3 {
                    Some(parts[1].trim().to_string())
                } else {
                    None
                }
            } else {
                None
            };

            let skill_name = skill_path
                .parent()
                .and_then(|p| p.file_name())
                .and_then(|n| n.to_str())
                .unwrap_or("Unknown Skill")
                .to_string();

            discovered.push(SkillMetadata {
                name: skill_name,
                path: skill_path.to_string_lossy().to_string(),
                agent_type: agent_type.to_string(),
                scope: scope.to_string(),
                frontmatter,
            });
        }
    }

    discovered
}
