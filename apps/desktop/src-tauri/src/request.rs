use std::sync::Arc;

use log::info;
use serde::{Deserialize, Serialize};
use tauri::Wry;
use tauri_plugin_store::Store;
use telemetry::LapHistoryData;

#[derive(Debug)]
pub enum RequestError {
    ReqwestError(reqwest::Error),
    HttpError(reqwest::StatusCode),
}

impl std::fmt::Display for RequestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RequestError::ReqwestError(e) => write!(f, "Reqwest error: {:#?}", e),
            RequestError::HttpError(e) => write!(f, "HTTP error: {:#?}", e),
        }
    }
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct ApiSessionResponse {
    pub status: String,
    pub session_uid: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct ApiLapResponse {
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiLapRequest {
    pub id: u8,
    pub lap_time_in_ms: u32,
    pub sector_1_time_in_ms: u16,
    pub sector_1_time_minutes: u8,
    pub sector_2_time_in_ms: u16,
    pub sector_2_time_minutes: u8,
    pub sector_3_time_in_ms: u16,
    pub sector_3_time_minutes: u8,
    pub lap_valid_bit_flags: u8,
}

impl ApiLapRequest {
    pub fn new(lap: &LapHistoryData, id: u8) -> Self {
        info!("Creating new lap request");
        Self {
            id,
            lap_time_in_ms: lap.lap_time_in_ms,
            sector_1_time_in_ms: lap.sector_1_time_in_ms,
            sector_1_time_minutes: lap.sector_1_time_minutes,
            sector_2_time_in_ms: lap.sector_2_time_in_ms,
            sector_2_time_minutes: lap.sector_2_time_minutes,
            sector_3_time_in_ms: lap.sector_3_time_in_ms,
            sector_3_time_minutes: lap.sector_3_time_minutes,
            lap_valid_bit_flags: lap.lap_valid_bit_flags,
        }
    }
}

pub trait RequestHandler {
    async fn post_new_session(&self, store: &Arc<Store<Wry>>) -> Result<ApiSessionResponse, RequestError>;
    async fn post_new_lap(&self, lap: &LapHistoryData, store: &Arc<Store<Wry>>) -> Result<ApiLapResponse, RequestError>;
}