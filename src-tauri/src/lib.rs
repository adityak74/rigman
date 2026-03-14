use tauri_plugin_sql::{Migration, MigrationKind};
use std::path::{Path, PathBuf};
use std::fs::{self, File};
use std::io::{Read, Write};
use walkdir::WalkDir;
use zip::write::FileOptions;
use zip::ZipWriter;

mod scanner;
use scanner::{AgentConfig, SkillMetadata};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn scan_skills(
    agents: Vec<AgentConfig>,
    projectRoot: String,
) -> Result<Vec<SkillMetadata>, String> {
    let project_path = PathBuf::from(projectRoot);
    let skills = scanner::scan_for_skills(agents, &project_path);
    Ok(skills)
}

#[tauri::command]
async fn read_skill_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_skill_file(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn export_skills_to_zip(skill_paths: Vec<String>, target_zip: String) -> Result<(), String> {
    let path = Path::new(&target_zip);
    let file = File::create(path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);
    
    // Fix: Explicitly specify type for FileOptions
    let options: FileOptions<'_, ()> = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    for skill_path_str in skill_paths {
        let skill_dir = Path::new(&skill_path_str);
        if !skill_dir.exists() || !skill_dir.is_dir() {
            continue;
        }

        let _skill_folder_name = skill_dir.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown_skill");

        for entry in WalkDir::new(skill_dir).into_iter().filter_map(|e| e.ok()) {
            let entry_path = entry.path();
            let name = entry_path.strip_prefix(skill_dir.parent().unwrap())
                .map_err(|e| e.to_string())?;

            if entry_path.is_file() {
                zip.start_file(name.to_string_lossy(), options).map_err(|e| e.to_string())?;
                let mut f = File::open(entry_path).map_err(|e| e.to_string())?;
                let mut buffer = Vec::new();
                f.read_to_end(&mut buffer).map_err(|e| e.to_string())?;
                zip.write_all(&buffer).map_err(|e| e.to_string())?;
            } else if !name.as_os_str().is_empty() {
                zip.add_directory(name.to_string_lossy(), options).map_err(|e| e.to_string())?;
            }
        }
    }

    zip.finish().map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: "
                CREATE TABLE agents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    global_path TEXT,
                    local_path TEXT
                );
                CREATE TABLE skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_id INTEGER,
                    name TEXT NOT NULL,
                    path TEXT NOT NULL,
                    scope TEXT NOT NULL,
                    frontmatter TEXT,
                    content TEXT,
                    tags TEXT,
                    FOREIGN KEY(agent_id) REFERENCES agents(id)
                );
                CREATE TABLE hooks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_id INTEGER,
                    name TEXT NOT NULL,
                    path TEXT NOT NULL,
                    lifecycle_event TEXT NOT NULL,
                    command TEXT NOT NULL,
                    FOREIGN KEY(agent_id) REFERENCES agents(id)
                );
            ",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:rigman.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            scan_skills, 
            read_skill_file, 
            save_skill_file,
            export_skills_to_zip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
