use std::{collections::BTreeMap, sync::Arc};

use log::info;
use serde::{Deserialize, Serialize};
use tauri::Wry;
use tauri_plugin_store::Store;
use telemetry::{session::Lap, CarTelemetryData};

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
    pub total_distance: f32,
    pub id: u8,
    pub lap_time_in_ms: u32,
    pub sector_1_time_in_ms: u16,
    pub sector_2_time_in_ms: u16,
    pub sector_3_time_in_ms: u16,
    pub lap_valid_bit_flags: u8,
    pub assists: u16,
    pub car_telemetry_data: BTreeMap<u32, CarTelemetryData>
}

impl ApiLapRequest {
    // we send the total distance of the session every lap, to make sure it is up to date on the server.
    pub fn new(lap: Lap, id: u8, total_distance: f32) -> Self {
        info!("Creating new lap request");
        Self {
            id,
            total_distance,
            lap_time_in_ms: lap.lap_time_in_ms,
            sector_1_time_in_ms: lap.sector_1_time_in_ms,
            sector_2_time_in_ms: lap.sector_2_time_in_ms,
            sector_3_time_in_ms: lap.sector_3_time_in_ms,
            lap_valid_bit_flags: lap.lap_valid_bit_flags,
            assists: lap.assists,
            car_telemetry_data: lap.car_telemetry
        }
    }
}

pub trait RequestHandler {
    async fn post_new_session(&self, store: &Arc<Store<Wry>>) -> Result<ApiSessionResponse, RequestError>;
    async fn post_new_lap(&self, lap: &Lap, store: &Arc<Store<Wry>>) -> Result<ApiLapResponse, RequestError>;
}