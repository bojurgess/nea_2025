use tauri::Builder;
use log4rs;

mod listener;
mod game_session;
mod auth;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .setup(|_app| {
            log4rs::init_file("logging_config.yaml", Default::default()).unwrap();
            Ok(())
        })
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![auth::authenticate, listener::listen_for_telemetry])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
