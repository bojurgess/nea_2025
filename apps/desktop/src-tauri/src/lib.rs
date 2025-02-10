use tauri::Builder;
use tauri::async_runtime::Mutex;

mod listener;
mod auth;

pub struct AppState {
    db_connection: sqlite::Connection
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            db_connection: sqlite::open(":memory:").unwrap()
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![auth::authenticate, listener::listen_for_telemetry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
