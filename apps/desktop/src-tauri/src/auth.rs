use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenResponse {
    access_token: String,
    expires_at: String
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ErrorResponse {
    error: String,
}

#[tauri::command]
pub async fn authenticate(refresh_token: &str) -> Result<TokenResponse, ErrorResponse> {
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