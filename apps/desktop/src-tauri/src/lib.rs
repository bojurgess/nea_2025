use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct TokenResponse {
    access_token: String,
    expires_at: String
}

#[derive(Serialize, Deserialize, Debug)]
struct ErrorResponse {
    error: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn authenticate(refresh_token: &str) -> Result<TokenResponse, ErrorResponse> {
    let mut map = HashMap::new();
    map.insert("refresh_token", refresh_token);
    
    let client = reqwest::Client::new();
    let res =  client.post("http://localhost:5173/auth/access-token")
        .json(&map)
        .send()
        .await
        .unwrap();

    match res.status() {
        reqwest::StatusCode::OK => {
            let body: TokenResponse = serde_json::from_value(res.json().await.unwrap()).unwrap();
            Ok(body)
        }
        reqwest::StatusCode::UNAUTHORIZED => {
            let body: ErrorResponse = serde_json::from_value(res.json().await.unwrap()).unwrap();
            Err(body)
        }
        _ => {
            panic!("I am stupid.")
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![authenticate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
