use tauri::Builder;

mod listener;
mod telemetry;
mod auth;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![auth::authenticate, listener::listen_for_telemetry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
