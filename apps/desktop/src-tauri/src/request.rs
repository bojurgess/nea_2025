use std::{collections::BTreeMap, sync::Arc};

use log::info;
use serde::{Deserialize, Serialize};
use tauri::Wry;
use tauri_plugin_store::Store;
use telemetry::{session::Lap, JSONCarTelemetryData};

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
    pub lap_number: u8,
    pub lap_time_in_ms: u32,
    pub sector1_time_in_ms: u16,
    pub sector2_time_in_ms: u16,
    pub sector3_time_in_ms: u16,
    pub lap_invalid: bool,
    pub assists: u16,
    pub total_distance: f32,
    pub car_telemetry: BTreeMap<u32, JSONCarTelemetryData>
}

impl ApiLapRequest {
    // we send the total distance of the session every lap, to make sure it is up to date on the server.
    pub fn new(lap: Lap) -> Self {
        info!("Creating new lap request");
        Self {
            lap_number: lap.lap_number + 1,
            total_distance: lap.total_distance,
            lap_time_in_ms: lap.lap_time_in_ms,
            sector1_time_in_ms: lap.sector1_time_in_ms,
            sector2_time_in_ms: lap.sector2_time_in_ms,
            sector3_time_in_ms: (lap.lap_time_in_ms - (lap.sector1_time_in_ms as u32 + lap.sector2_time_in_ms as u32)) as u16,
            lap_invalid: lap.lap_invalid,
            assists: lap.assists.unwrap().get_mask().unwrap(),
            car_telemetry: lap.car_telemetry
        }
    }
}

pub trait RequestHandler {
    async fn post_new_session(&self, store: &Arc<Store<Wry>>) -> Result<ApiSessionResponse, RequestError>;
    async fn post_new_lap(&self, lap: &Lap, store: &Arc<Store<Wry>>) -> Result<ApiLapResponse, RequestError>;
}